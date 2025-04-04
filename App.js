import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const ConquestMapApp = () => {
  // App state management and metadata
  const [version] = useState('1.0');
  const [lastSaved, setLastSaved] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'grid'
  
  // Node positions precisely matched to your latest image
  const nodePositions = {
    A: { top: 100, left: 550 },
    B: { top: 220, left: 310 },
    C: { top: 220, left: 550 },
    D: { top: 220, left: 790 },
    E: { top: 480, left: 100 },
    F: { top: 480, left: 310 },
    G: { top: 380, left: 480 },
    H: { top: 380, left: 620 },
    I: { top: 550, left: 480 },
    J: { top: 550, left: 620 },
    K: { top: 480, left: 790 },
    L: { top: 480, left: 1000 },
    M: { top: 700, left: 310 },
    N: { top: 700, left: 550 },
    O: { top: 700, left: 790 },
    P: { top: 820, left: 550 }
  };
  
  // Guild tower positions matched to your latest image
  const guildPositions = {
    'blue': { top: 100, left: 100 },
    'yellow': { top: 900, left: 100 },
    'purple': { top: 100, left: 1000 },
    'red': { top: 900, left: 1000 }
  };
  
  // State management
  const [nodes, setNodes] = useState({
    A: { id: 'A', players: [], color: 'green', value: 100, connections: ['B', 'C', 'D'] },
    B: { id: 'B', players: [], color: 'green', value: 80, connections: ['A', 'E'] },
    C: { id: 'C', players: [], color: 'green', value: 100, connections: ['A', 'G'] },
    D: { id: 'D', players: [], color: 'green', value: 80, connections: ['A', 'K'] },
    E: { id: 'E', players: [], color: 'green', value: 100, connections: ['B', 'F'] },
    F: { id: 'F', players: [], color: 'green', value: 120, connections: ['E', 'G'] },
    G: { id: 'G', players: [], color: 'green', value: 100, connections: ['C', 'F', 'H', 'I'] },
    H: { id: 'H', players: [], color: 'green', value: 120, connections: ['G', 'J'] },
    I: { id: 'I', players: [], color: 'green', value: 120, connections: ['G', 'J'] },
    J: { id: 'J', players: [], color: 'green', value: 100, connections: ['H', 'I', 'N'] },
    K: { id: 'K', players: [], color: 'green', value: 120, connections: ['D', 'L'] },
    L: { id: 'L', players: [], color: 'green', value: 100, connections: ['K'] },
    M: { id: 'M', players: [], color: 'green', value: 80, connections: ['P'] },
    N: { id: 'N', players: [], color: 'green', value: 100, connections: ['J', 'P'] },
    O: { id: 'O', players: [], color: 'green', value: 80, connections: ['P'] },
    P: { id: 'P', players: [], color: 'green', value: 100, connections: ['M', 'N', 'O'] }
  });
  
  const [guilds, setGuilds] = useState({
    'blue': { name: 'Blue Guild', color: '#1E90FF', score: 512 },
    'purple': { name: 'Purple Guild', color: '#9932CC', score: 1437 },
    'yellow': { name: 'Yellow Guild', color: '#FFD700', score: 0 },
    'red': { name: 'Red Guild', color: '#DC143C', score: 361 }
  });
  
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedGuild, setSelectedGuild] = useState('blue');
  const [playerInput, setPlayerInput] = useState('');
  const [csvContent, setCsvContent] = useState('');
  
  // Simple rendering of connections - temporarily disabled
  const renderConnections = () => {
    return [];
  };
  
  // Edit guild properties
  const editGuild = (guildKey, field, value) => {
    setGuilds(prev => {
      const updated = { ...prev };
      if (field === 'score') {
        updated[guildKey] = { ...updated[guildKey], score: parseInt(value) || 0 };
      } else if (field === 'name') {
        updated[guildKey] = { ...updated[guildKey], name: value };
      } else if (field === 'color') {
        updated[guildKey] = { ...updated[guildKey], color: value };
      }
      return updated;
    });
  };

  // Handle file upload for player list
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setCsvContent(content);
        
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const players = results.data.map(row => row.name || row.player || row.username || Object.values(row)[0]);
            setAllPlayers([...new Set(players)]);
          }
        });
      };
      reader.readAsText(file);
    }
  };
  
  // Handle player assignment to nodes
  const assignPlayerToNode = (playerId) => {
    if (!selectedNode) return;
    
    setNodes(prev => {
      const updatedNodes = { ...prev };
      const node = updatedNodes[selectedNode];
      
      // Check if player is already assigned to this node
      if (!node.players.includes(playerId)) {
        node.players = [...node.players, playerId];
      }
      
      return updatedNodes;
    });
  };
  
  // Handle node color change
  const changeNodeColor = (nodeId, guild) => {
    setNodes(prev => {
      const updatedNodes = { ...prev };
      updatedNodes[nodeId].color = guilds[guild].color;
      return updatedNodes;
    });
    
    // Update guild scores
    updateGuildScores();
  };
  
  // Calculate and update guild scores
  const updateGuildScores = () => {
    const scores = {
      'blue': 0,
      'purple': 0,
      'yellow': 0,
      'red': 0
    };
    
    // Count node values for each guild
    Object.values(nodes).forEach(node => {
      const guildKey = Object.entries(guilds).find(([key, guild]) => 
        guild.color === node.color
      )?.[0];
      
      if (guildKey) {
        scores[guildKey] += node.value;
      }
    });
    
    // Update guild scores
    setGuilds(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        updated[key] = { ...updated[key], score: scores[key] };
      });
      return updated;
    });
  };
  
  // Add a new player
  const addNewPlayer = () => {
    if (playerInput.trim() && !allPlayers.includes(playerInput.trim())) {
      setAllPlayers([...allPlayers, playerInput.trim()]);
      setPlayerInput('');
    }
  };
  
  // Remove player from node
  const removePlayerFromNode = (nodeId, playerIndex) => {
    setNodes(prev => {
      const updatedNodes = { ...prev };
      updatedNodes[nodeId].players.splice(playerIndex, 1);
      return updatedNodes;
    });
  };
  
  // Export data with timestamp and filename
  const exportData = () => {
    // Add metadata to help with versioning
    const timestamp = new Date().toISOString();
    setLastSaved(timestamp);
    
    const data = {
      version: version,
      exportedAt: timestamp,
      nodes,
      guilds,
      players: allPlayers,
      selectedNode,
      viewMode,
      // Include node positions and guild positions for layout consistency
      nodePositions,
      guildPositions
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    // Generate filename with date for better organization
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const time = `${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}`;
    const exportFileDefaultName = `conquest-map-${formattedDate}-${time}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import data with validation and error handling
  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validate the data structure
          if (!data.nodes || !data.guilds) {
            alert("Invalid file format: Missing required data structures");
            return;
          }
          
          // Import the core data
          setNodes(data.nodes);
          setGuilds(data.guilds);
          
          // Import additional data if available
          if (data.players && Array.isArray(data.players)) {
            setAllPlayers(data.players);
          }
          
          // Restore view mode if available
          if (data.viewMode) {
            setViewMode(data.viewMode);
          }
          
          // Restore selected node if available
          if (data.selectedNode && data.nodes[data.selectedNode]) {
            setSelectedNode(data.selectedNode);
          } else {
            setSelectedNode(null);
          }
          
          // Record when this file was created
          if (data.exportedAt) {
            setLastSaved(data.exportedAt);
          }
          
          // Show success message with filename
          alert(`Data imported successfully from "${file.name}"!`);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert(`Error importing data: ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  // Create grid layout data
  const generateGridData = () => {
    // This will closely match the grid layout shown in the second image
    return [
      // Top row
      { 
        cells: [
          { id: 'top-left', nodes: ['B'], span: 1 },
          { id: 'top-center', nodes: ['A', 'C'], span: 1 },
          { id: 'top-right', nodes: ['D'], span: 1 }
        ]
      },
      // Middle row
      { 
        cells: [
          { id: 'mid-left', nodes: ['E', 'F'], span: 1 },
          { id: 'mid-center', nodes: ['G', 'H'], span: 1 },
          { id: 'mid-right', nodes: ['K', 'L'], span: 1 }
        ]
      },
      // Bottom-middle row
      { 
        cells: [
          { id: 'lower-mid-left', nodes: ['I'], span: 1 },
          { id: 'lower-mid-center', nodes: [], span: 1 },
          { id: 'lower-mid-right', nodes: ['J'], span: 1 }
        ]
      },
      // Bottom row
      { 
        cells: [
          { id: 'bottom-left', nodes: ['M'], span: 1 },
          { id: 'bottom-center', nodes: ['N', 'P'], span: 1 },
          { id: 'bottom-right', nodes: ['O'], span: 1 }
        ]
      }
    ];
  };

  // Grid view data
  const gridData = generateGridData();
  
  // Render a cell for the grid view
  const renderGridCell = (cell) => {
    // If no nodes in cell, return empty div
    if (!cell.nodes || cell.nodes.length === 0) {
      return <div className="bg-gray-900 p-2 rounded"></div>;
    }
    
    // Get players from all nodes in this cell
    const allPlayers = cell.nodes.flatMap(nodeId => {
      if (!nodes[nodeId]) return [];
      return nodes[nodeId].players.map(player => ({ player, node: nodeId }));
    });
    
    // Get colors of all nodes in this cell
    const nodeColors = cell.nodes
      .filter(nodeId => nodes[nodeId])
      .map(nodeId => nodes[nodeId].color);
    
    // Group players by node
    const playersByNode = {};
    allPlayers.forEach(({ player, node }) => {
      if (!playersByNode[node]) {
        playersByNode[node] = [];
      }
      playersByNode[node].push(player);
    });
    
    return (
      <div 
        className="bg-gray-900 p-2 rounded flex flex-col"
        style={{ gridColumn: `span ${cell.span || 1}` }}
      >
        {Object.entries(playersByNode).map(([nodeId, players]) => (
          <div key={nodeId} className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-orange-400">{nodeId} {nodes[nodeId]?.value}</span>
              <span className="text-yellow-400 text-sm">({players.length})</span>
            </div>
            <div className="text-yellow-300 text-sm">
              {players.map((player, idx) => (
                <div key={idx}>{player}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">AFKJ: Clashfront Manager by Ԁ'ѧяċ</h1>
          {lastSaved && (
            <span className="text-xs text-gray-400">
              Last Saved: {new Date(lastSaved).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <div className="flex mr-2">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-3 py-1 rounded-l ${viewMode === 'map' ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              Map View
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-r ${viewMode === 'grid' ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              Grid View
            </button>
          </div>
          
          <div className="flex">
            <button 
              onClick={exportData}
              className="bg-blue-600 px-3 py-1 rounded-l hover:bg-blue-700 flex items-center"
              title="Save your current map data to a file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Save
            </button>
            
            <label className="bg-green-600 px-3 py-1 rounded-r hover:bg-green-700 cursor-pointer flex items-center"
              title="Load a previously saved map file">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Load
              <input 
                type="file" 
                accept=".json" 
                className="hidden" 
                onChange={importData}
              />
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Player management */}
        <div className="w-64 bg-gray-100 p-4 flex flex-col overflow-auto">
          <h2 className="font-bold mb-2">Player Management</h2>
          
          <div className="mb-4">
            <label className="block text-sm mb-1">Import Players CSV</label>
            <input 
              type="file" 
              accept=".csv" 
              className="w-full text-sm"
              onChange={handleFileUpload}
            />
          </div>
          
          <div className="mb-4 flex">
            <input
              type="text"
              value={playerInput}
              onChange={e => setPlayerInput(e.target.value)}
              placeholder="Add new player"
              className="flex-1 p-2 border rounded"
            />
            <button 
              onClick={addNewPlayer}
              className="bg-blue-500 text-white px-2 ml-1 rounded"
            >
              +
            </button>
          </div>
          
          <div className="mb-4">
            <h3 className="font-bold text-sm mb-1">Available Players</h3>
            <div className="max-h-36 overflow-y-auto border rounded bg-white p-2">
              {allPlayers.map((player, idx) => (
                <div 
                  key={idx} 
                  className="p-1 cursor-pointer hover:bg-blue-100 text-sm"
                  onClick={() => assignPlayerToNode(player)}
                >
                  {player}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-sm mb-1">Guild Management</h3>
            <div className="mb-4">
              {Object.entries(guilds).map(([key, guild]) => (
                <div key={key} className="mb-2 border rounded p-2 bg-white">
                  <div className="flex items-center mb-1">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: guild.color }}
                    ></div>
                    <input
                      type="text"
                      value={guild.name}
                      onChange={(e) => editGuild(key, 'name', e.target.value)}
                      className="flex-1 text-sm p-1 border rounded"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="text-xs mr-2">Score:</label>
                    <input
                      type="number"
                      value={guild.score}
                      onChange={(e) => editGuild(key, 'score', e.target.value)}
                      className="flex-1 text-sm p-1 border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <h3 className="font-bold text-sm mb-1">Color Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(guilds).map(([key, guild]) => (
                <button
                  key={key}
                  className="p-2 text-white text-sm rounded"
                  style={{ backgroundColor: guild.color }}
                  onClick={() => {
                    setSelectedGuild(key);
                    if (selectedNode) {
                      changeNodeColor(selectedNode, key);
                    }
                  }}
                >
                  {guild.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {viewMode === 'map' ? (
          /* Main map area */
          <div className="flex-1 bg-black overflow-auto relative">
            <div className="w-full h-full min-w-[1100px] min-h-[1000px]">
              <svg width="1100" height="1000" className="absolute top-0 left-0">
                {renderConnections()}
              </svg>
              
              {/* Render nodes */}
              {Object.entries(nodes).map(([nodeId, node]) => (
                <div
                  key={nodeId}
                  className={`absolute w-24 h-24 flex items-center justify-center rounded-md cursor-pointer transition-all border-2 ${
                    selectedNode === nodeId ? 'border-yellow-400' : 'border-transparent'
                  }`}
                  style={{
                    top: `${nodePositions[nodeId]?.top || 0}px`,
                    left: `${nodePositions[nodeId]?.left || 0}px`,
                    backgroundColor: node.color || 'green',
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setSelectedNode(nodeId)}
                >
                  <div className="text-center">
                    <div className="text-white font-bold text-3xl">{nodeId}</div>
                    <div className="text-white text-lg">{node.value}</div>
                    {node.players.length > 0 && (
                      <div className="text-white text-sm">({node.players.length})</div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Render guild towers */}
              {Object.entries(guilds).map(([key, guild]) => (
                <div
                  key={key}
                  className="absolute w-24 h-40 flex flex-col items-center"
                  style={{
                    top: `${guildPositions[key]?.top || 0}px`,
                    left: `${guildPositions[key]?.left || 0}px`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div
                    className="w-20 h-36 rounded-b-lg"
                    style={{ 
                      backgroundColor: guild.color,
                      clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)'
                    }}
                  ></div>
                  <div className="text-white mt-1 text-lg">{guild.score}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid view */
          <div className="flex-1 bg-gray-800 p-4 overflow-auto">
            <div className="grid grid-cols-1 gap-4 max-w-4xl mx-auto">
              {gridData.map((row, rowIdx) => (
                <div key={`row-${rowIdx}`} className="grid grid-cols-3 gap-4">
                  {row.cells.map((cell, cellIdx) => (
                    <div 
                      key={`${rowIdx}-${cellIdx}`}
                      style={{ gridColumn: `span ${cell.span || 1}` }}
                    >
                      {renderGridCell(cell)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Right panel - Node details */}
        {selectedNode && (
          <div className="w-64 bg-gray-100 p-4 overflow-auto">
            <h2 className="font-bold mb-2">Node {selectedNode} Details</h2>
            
            <div className="mb-4">
              <h3 className="text-sm font-bold">Value: {nodes[selectedNode].value}</h3>
              <div className="flex mt-2 space-x-2">
                {Object.entries(guilds).map(([key, guild]) => (
                  <button
                    key={key}
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: guild.color }}
                    onClick={() => changeNodeColor(selectedNode, key)}
                  ></button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold mb-2">Assigned Players ({nodes[selectedNode].players.length})</h3>
              <div className="bg-white rounded border p-2 max-h-64 overflow-y-auto">
                {nodes[selectedNode].players.map((player, idx) => (
                  <div key={idx} className="flex justify-between items-center p-1 text-sm hover:bg-red-50">
                    <span>{player}</span>
                    <button 
                      onClick={() => removePlayerFromNode(selectedNode, idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConquestMapApp;