class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0;
    this.pathLength = 0;
    this.isMoving = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const TILE_SIZE = 32;
    const MAP_SIZE = 20;
    
    // 创建纹理
    this.createTextures(TILE_SIZE);
    
    // 创建tilemap数据
    const mapData = this.generateMapData(MAP_SIZE, 0.3);
    
    // 创建tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE
    });
    
    const tiles = map.addTilesetImage('tiles', null, TILE_SIZE, TILE_SIZE);
    const layer = map.createLayer(0, tiles, 0, 0);
    
    this.mapData = mapData;
    this.mapSize = MAP_SIZE;
    this.tileSize = TILE_SIZE;
    
    // 创建玩家
    this.player = this.add.sprite(TILE_SIZE / 2, TILE_SIZE / 2, 'player');
    this.playerTileX = 0;
    this.playerTileY = 0;
    
    // 添加点击事件
    this.input.on('pointerdown', (pointer) => {
      if (!this.isMoving) {
        this.handleClick(pointer);
      }
    });
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.updateStatus();
    
    // 路径显示
    this.pathGraphics = this.add.graphics();
  }

  createTextures(size) {
    // 地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x90EE90, 1);
    groundGraphics.fillRect(0, 0, size, size);
    groundGraphics.lineStyle(1, 0x228B22, 0.3);
    groundGraphics.strokeRect(0, 0, size, size);
    groundGraphics.generateTexture('ground', size, size);
    groundGraphics.destroy();
    
    // 障碍物纹理
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x696969, 1);
    wallGraphics.fillRect(0, 0, size, size);
    wallGraphics.lineStyle(1, 0x000000, 0.5);
    wallGraphics.strokeRect(0, 0, size, size);
    wallGraphics.generateTexture('wall', size, size);
    wallGraphics.destroy();
    
    // 玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000FF, 1);
    playerGraphics.fillCircle(size / 2, size / 2, size / 3);
    playerGraphics.generateTexture('player', size, size);
    playerGraphics.destroy();
  }

  generateMapData(size, obstacleRatio) {
    const data = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        // 起点(0,0)不放障碍
        if (x === 0 && y === 0) {
          row.push(0);
        } else {
          row.push(Math.random() < obstacleRatio ? 1 : 0);
        }
      }
      data.push(row);
    }
    return data;
  }

  handleClick(pointer) {
    const tileX = Math.floor(pointer.x / this.tileSize);
    const tileY = Math.floor(pointer.y / this.tileSize);
    
    if (tileX < 0 || tileX >= this.mapSize || tileY < 0 || tileY >= this.mapSize) {
      return;
    }
    
    if (this.mapData[tileY][tileX] === 1) {
      console.log('Cannot move to obstacle');
      return;
    }
    
    const path = this.findPath(
      this.playerTileX,
      this.playerTileY,
      tileX,
      tileY
    );
    
    if (path && path.length > 0) {
      this.pathLength = path.length;
      this.moveAlongPath(path);
      this.drawPath(path);
    } else {
      console.log('No path found');
    }
  }

  findPath(startX, startY, endX, endY) {
    // A* 寻路算法
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = `${startX},${startY}`;
    const endKey = `${endX},${endY}`;
    
    openList.push({ x: startX, y: startY, key: startKey });
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(startX, startY, endX, endY));
    
    while (openList.length > 0) {
      // 找到 fScore 最小的节点
      openList.sort((a, b) => fScore.get(a.key) - fScore.get(b.key));
      const current = openList.shift();
      
      if (current.key === endKey) {
        return this.reconstructPath(cameFrom, current.key);
      }
      
      closedList.add(current.key);
      
      // 检查四个方向的邻居
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        const nx = neighbor.x;
        const ny = neighbor.y;
        const nKey = `${nx},${ny}`;
        
        if (nx < 0 || nx >= this.mapSize || ny < 0 || ny >= this.mapSize) {
          continue;
        }
        
        if (this.mapData[ny][nx] === 1) {
          continue;
        }
        
        if (closedList.has(nKey)) {
          continue;
        }
        
        const tentativeGScore = gScore.get(current.key) + 1;
        
        if (!gScore.has(nKey) || tentativeGScore < gScore.get(nKey)) {
          cameFrom.set(nKey, current.key);
          gScore.set(nKey, tentativeGScore);
          fScore.set(nKey, tentativeGScore + this.heuristic(nx, ny, endX, endY));
          
          if (!openList.find(n => n.key === nKey)) {
            openList.push({ x: nx, y: ny, key: nKey });
          }
        }
      }
    }
    
    return null;
  }

  heuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  reconstructPath(cameFrom, currentKey) {
    const path = [];
    let current = currentKey;
    
    while (cameFrom.has(current)) {
      const [x, y] = current.split(',').map(Number);
      path.unshift({ x, y });
      current = cameFrom.get(current);
    }
    
    return path;
  }

  moveAlongPath(path) {
    this.isMoving = true;
    let index = 0;
    
    const moveNext = () => {
      if (index >= path.length) {
        this.isMoving = false;
        this.pathGraphics.clear();
        return;
      }
      
      const target = path[index];
      this.playerTileX = target.x;
      this.playerTileY = target.y;
      
      this.tweens.add({
        targets: this.player,
        x: target.x * this.tileSize + this.tileSize / 2,
        y: target.y * this.tileSize + this.tileSize / 2,
        duration: 150,
        onComplete: () => {
          this.moveCount++;
          this.updateStatus();
          index++;
          moveNext();
        }
      });
    };
    
    moveNext();
  }

  drawPath(path) {
    this.pathGraphics.clear();
    this.pathGraphics.lineStyle(3, 0xFFFF00, 0.5);
    
    if (path.length > 0) {
      this.pathGraphics.beginPath();
      this.pathGraphics.moveTo(
        this.playerTileX * this.tileSize + this.tileSize / 2,
        this.playerTileY * this.tileSize + this.tileSize / 2
      );
      
      for (const point of path) {
        this.pathGraphics.lineTo(
          point.x * this.tileSize + this.tileSize / 2,
          point.y * this.tileSize + this.tileSize / 2
        );
      }
      
      this.pathGraphics.strokePath();
    }
  }

  updateStatus() {
    this.statusText.setText(
      `Moves: ${this.moveCount} | Last Path: ${this.pathLength} tiles`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  backgroundColor: '#333333',
  scene: GameScene
};

new Phaser.Game(config);