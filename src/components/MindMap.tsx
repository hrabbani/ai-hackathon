import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { createRoot } from 'react-dom/client';
import SongIcon from './SongIcon';
import { SongData } from '../types/song';
import { getAlbumCover, getAccessToken } from '../utils/spotifyApi';

interface MindMapProps {
  data: SongData[];
  onCoordinatesUpdate?: (songName: string, artist: string, newCoordinates: { x: number; y: number; z: number }) => void;
}

const MindMap: React.FC<MindMapProps> = ({ data, onCoordinatesUpdate }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);
  const [albumCovers, setAlbumCovers] = useState<Record<string, string>>({});
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [localData, setLocalData] = useState<SongData[]>(data);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);

  const handleNodeClick = (event: MouseEvent, d: SongData) => {
    const key = `${d.song_name}-${d.artist}`;
    const newSelected = new Set(selectedSongs);

    if (event.shiftKey) {
      // Toggle selection with shift key
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
    } else {
      // Single selection without shift key
      newSelected.clear();
      newSelected.add(key);
    }

    setSelectedSongs(newSelected);
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const token = await getAccessToken();
        console.log('Access token obtained:', token ? 'Yes' : 'No');
        setAccessToken(token);
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };
    fetchAccessToken();
  }, []);

  useEffect(() => {
    const fetchAlbumCovers = async () => {
      if (!accessToken) {
        console.log('Waiting for access token...');
        return;
      }
      
      console.log('Starting album cover fetch with token:', accessToken);
      const covers: Record<string, string> = {};
      for (const song of data) {
        try {
          console.log(`Processing song: ${song.song_name} - ${song.artist}`);
          const cover = await getAlbumCover(song.song_name, song.artist, accessToken);
          if (cover) {
            console.log(`Found cover for ${song.song_name} - ${song.artist}`);
            covers[`${song.song_name}-${song.artist}`] = cover;
          } else {
            console.log(`No cover found for ${song.song_name} - ${song.artist}`);
          }
        } catch (error) {
          console.error(`Error fetching cover for ${song.song_name}:`, error);
        }
      }
      console.log('Finished fetching album covers:', covers);
      setAlbumCovers(covers);
    };

    // Fetch covers when access token changes or data length changes
    if (accessToken) {
      console.log('Access token available, fetching covers...');
      fetchAlbumCovers();
    }
  }, [accessToken, data.length]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    // Create a group for zooming
    const zoomGroup = svg.append('g');

    // Create a group for nodes that will be transformed by zoom
    const nodesGroup = zoomGroup.append('g');

    // Apply initial zoom transform
    zoomGroup.attr('transform', zoomTransform.toString());

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        setZoomTransform(event.transform);
        zoomGroup.attr('transform', event.transform.toString());
      });

    // Apply zoom to SVG and prevent default behaviors
    svg.call(zoom)
      .on('dblclick.zoom', null)
      .on('mousedown.zoom', null)
      .on('touchstart.zoom', null)
      .on('touchmove.zoom', null)
      .on('touchend.zoom', null);

    // Create drag behavior
    const drag = d3.drag<SVGGElement, SongData>()
      .on('start', (event) => {
        if (event.sourceEvent) {
          event.sourceEvent.stopPropagation();
        }
        d3.select(event.sourceEvent?.target || event.target).classed('dragging', true);
      })
      .on('drag', (event, d) => {
        if (event.sourceEvent) {
          event.sourceEvent.stopPropagation();
        }
        
        // Get the current transform of the node
        const node = d3.select(event.sourceEvent?.target?.parentNode || event.target.parentNode);
        const currentTransform = d3.zoomTransform(svg.node() as SVGSVGElement);
        
        // Calculate the position in the original coordinate space
        const x = (event.x - currentTransform.x) / currentTransform.k;
        const y = (event.y - currentTransform.y) / currentTransform.k;
        
        // Update the node's position with the current zoom transform
        node.attr('transform', `translate(${x * currentTransform.k + currentTransform.x}, ${y * currentTransform.k + currentTransform.y})`);
        
        // Convert back to our normalized coordinate space
        const normalizedX = (x - width/2) / 100;
        const normalizedY = (y - height/2) / 100;
        
        // Update local data for the dragged node only
        const newData = localData.map(song => {
          if (song.song_name === d.song_name && song.artist === d.artist) {
            return {
              ...song,
              coordinates2: {
                ...song.coordinates2,
                x: normalizedX,
                y: normalizedY
              }
            };
          }
          return song;
        });
        setLocalData(newData);

        // Notify parent component
        if (onCoordinatesUpdate) {
          onCoordinatesUpdate(d.song_name, d.artist, { x: normalizedX, y: normalizedY, z: d.coordinates2.z });
        }
      })
      .on('end', (event) => {
        if (event.sourceEvent) {
          event.sourceEvent.stopPropagation();
        }
        d3.select(event.sourceEvent?.target || event.target).classed('dragging', false);
      });

    // Create nodes
    const nodes = nodesGroup.selectAll('.node')
      .data(localData, (d: unknown) => {
        const song = d as SongData;
        return `${song.song_name}-${song.artist}`;
      })
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: SongData) => {
        const x = d.coordinates2.x * 100 + width/2;
        const y = d.coordinates2.y * 100 + height/2;
        return `translate(${x}, ${y})`;
      })
      .style('cursor', 'move')
      .call(drag)
      .on('click', (event, d) => {
        if (event.sourceEvent) {
          event.sourceEvent.stopPropagation();
        }
        handleNodeClick(event, d);
      });

    // Add SongIcon to each node
    nodes.each(function(this: SVGGElement, d: SongData) {
      const node = d3.select(this);
      const icon = node.append('foreignObject')
        .attr('width', 160)
        .attr('height', 200)
        .attr('x', -80)
        .attr('y', -100);

      const div = icon.append('xhtml:div')
        .style('width', '100%')
        .style('height', '100%')
        .style('display', 'flex')
        .style('justify-content', 'center')
        .style('align-items', 'center');

      const songIcon = document.createElement('div');
      const root = createRoot(songIcon);
      root.render(
        <SongIcon
          albumArtUrl={albumCovers[`${d.song_name}-${d.artist}`] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9ImJsYWNrIi8+PC9zdmc+'}
          title={d.song_name}
          artist={d.artist}
          onClick={() => console.log('Song clicked:', d)}
          selected={selectedSongs.has(`${d.song_name}-${d.artist}`)}
        />
      );
      const divNode = div.node() as HTMLDivElement;
      if (divNode) {
        divNode.appendChild(songIcon);
      }
    });

    // Add tooltips
    nodes.append('title')
      .text((d: SongData) => `${d.song_name} - ${d.artist}`);

  }, [localData, albumCovers, onCoordinatesUpdate, selectedSongs, zoomTransform]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <svg 
        ref={svgRef} 
        style={{ width: '100%', height: '100%' }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          // Check if we're clicking on a node
          const target = e.target as HTMLElement;
          if (!target.closest('.node')) {
            setSelectedSongs(new Set());
          }
        }}
      />
    </div>
  );
};

export default MindMap;