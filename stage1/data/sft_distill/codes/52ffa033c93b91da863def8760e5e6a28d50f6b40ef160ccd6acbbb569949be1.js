class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 状态信号：移动次数
    this.isMoving = false;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    const tileSize = 64;
    
    // 创建地板纹理
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, tileSize, tileSize);
    floorGraphics.lineStyle(2, 0x999999, 1);
    floorGraphics.strokeRect(0, 0, tileSize, tileSize);
    floorGraphics.generateTexture('floor', tileSize, tileSize);
    floorGraphics.destroy();
    
    // 创建障碍物纹理
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x333333, 1);
    wallGraphics.fillRect(0, 0, tileSize, tileSize);
    wallGraphics.fillStyle(0x555555, 1);
    wallGraphics.fillRect(8, 8, tileSize - 16, tileSize - 16);
    wallGraphics.generateTexture('wall', tileSize, tileSize);
    wallGraphics.destroy();
    
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 3);
    playerGraphics.generateTexture('player', tileSize, tileSize);
    playerGraphics.destroy();
    
    // 创建路径指示纹理
    const pathGraphics = this.add.graphics();
    pathGraphics.fillStyle(0xffff00, 0.5);
    pathGraphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 4);
    pathGraphics.generateTexture('pathMarker', tileSize, tileSize);
    pathGraphics.destroy();
  }

  create() {
    const mapWidth = 8;
    const mapHeight = 8;
    const tileSize = 64;
    
    // 创建地图数据
    this.mapData = this.generateMap(mapWidth, mapHeight, 0.3);
    
    // 创建Tilemap
    const map = this.make.tilemap({
      data: this.mapData,
      tileWidth: tileSize,
      tileHeight: tileSize
    });
    
    // 添加tileset（使用程序化生成的纹理）
    const tiles = map.addTilesetImage('floor');
    
    // 创建图层
    this.layer = map.createLayer(0, tiles, 50, 50);
    
    // 渲染地图
    this.renderMap();
    
    // 创建玩家
    this.player = this.add.sprite(50 + tileSize / 2, 50 + tileSize / 2, 'player');
    this.playerTilePos = { x: 0, y: 0 };
    
    // 路径标记容器
    this.pathMarkers = [];
    
    // 添加点击事件
    this.input.on('pointerdown', (pointer) => {
      this.handleClick(pointer);
    });
    
    // 显示UI
    this.createUI();
  }

  generateMap(width, height, obstacleRatio) {
    const map = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        // 起点(0,0)不放障碍
        if (x === 0 && y === 0) {
          row.push(0);
        } else {
          row.push(Math.random() < obstacleRatio ? 1 : 0);
        }
      }
      map.push(row);
    }
    return map;
  }

  renderMap() {
    const tileSize = 64;
    const offsetX = 50;
    const offsetY = 50;
    
    for (let y = 0; y < this.mapData.length; y++) {
      for (let x = 0; x < this.mapData[y].length; x++) {
        const tileType = this.mapData[y][x];
        const texture = tileType === 1 ? 'wall' : 'floor';
        this.add.image(
          offsetX + x * tileSize + tileSize / 2,
          offsetY + y * tileSize + tileSize / 2,
          texture
        );
      }
    }
  }

  handleClick(pointer) {
    if (this.isMoving) return;
    
    const tileSize = 64;
    const offsetX = 50;
    const offsetY = 50;
    
    // 计算点击的tile坐标
    const tileX = Math.floor((pointer.x - offsetX) / tileSize);
    const tileY = Math.floor((pointer.y - offsetY) / tileSize);
    
    // 检查是否在地图范围内
    if (tileX < 0 || tileX >= 8 || tileY < 0 || tileY >= 8) return;
    
    // 检查是否是障碍物
    if (this.mapData[tileY][tileX] === 1) return;
    
    // 寻路
    const path = this.findPath(this.playerTilePos, { x: tileX, y: tileY });
    
    if (path && path.length > 0) {
      this.showPath(path);
      this.moveAlongPath(path);
    }
  }

  findPath(start, end) {
    // A* 寻路算法
    const openList = [];
    const closedList = [];
    const startNode = {
      x: start.x,
      y: start.y,
      g: 0,
      h: this.heuristic(start, end),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);
    
    while (openList.length > 0) {
      // 找到f值最小的节点
      let currentIndex = 0;
      for (let i = 1; i < openList.length; i++) {
        if (openList[i].f < openList[currentIndex].f) {
          currentIndex = i;
        }
      }
      
      const current = openList[currentIndex];
      
      // 到达终点
      if (current.x === end.x && current.y === end.y) {
        return this.reconstructPath(current);
      }
      
      // 移到closed列表
      openList.splice(currentIndex, 1);
      closedList.push(current);
      
      // 检查邻居
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        // 跳过已访问的
        if (closedList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
          continue;
        }
        
        const gScore = current.g + 1;
        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          neighbor.g = gScore;
          neighbor.h = this.heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openList.push(neighbor);
        } else if (gScore < existingNode.g) {
          existingNode.g = gScore;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }
    
    return null; // 无路径
  }

  heuristic(a, b) {
    // 曼哈顿距离
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  getNeighbors(node) {
    const neighbors = [];
    const directions = [
      { x: 0, y: -1 }, // 上
      { x: 1, y: 0 },  // 右
      { x: 0, y: 1 },  // 下
      { x: -1, y: 0 }  // 左
    ];
    
    for (const dir of directions) {
      const newX = node.x + dir.x;
      const newY = node.y + dir.y;
      
      if (newX >= 0 && newX < 8 && newY >= 0 && newY < 8) {
        if (this.mapData[newY][newX] === 0) {
          neighbors.push({ x: newX, y: newY });
        }
      }
    }
    
    return neighbors;
  }

  reconstructPath(node) {
    const path = [];
    let current = node;
    while (current.parent) {
      path.unshift({ x: current.x, y: current.y });
      current = current.parent;
    }
    return path;
  }

  showPath(path) {
    // 清除旧的路径标记
    this.pathMarkers.forEach(marker => marker.destroy());
    this.pathMarkers = [];
    
    const tileSize = 64;
    const offsetX = 50;
    const offsetY = 50;
    
    // 显示新路径
    path.forEach(pos => {
      const marker = this.add.image(
        offsetX + pos.x * tileSize + tileSize / 2,
        offsetY + pos.y * tileSize + tileSize / 2,
        'pathMarker'
      );
      this.pathMarkers.push(marker);
    });
  }

  moveAlongPath(path) {
    if (path.length === 0) return;
    
    this.isMoving = true;
    const tileSize = 64;
    const offsetX = 50;
    const offsetY = 50;
    
    let currentIndex = 0;
    
    const moveToNext = () => {
      if (currentIndex >= path.length) {
        this.isMoving = false;
        this.pathMarkers.forEach(marker => marker.destroy());
        this.pathMarkers = [];
        return;
      }
      
      const target = path[currentIndex];
      const targetX = offsetX + target.x * tileSize + tileSize / 2;
      const targetY = offsetY + target.y * tileSize + tileSize / 2;
      
      this.tweens.add({
        targets: this.player,
        x: targetX,
        y: targetY,
        duration: 200,
        onComplete: () => {
          this.playerTilePos = { x: target.x, y: target.y };
          this.moveCount++;
          this.updateUI();
          currentIndex++;
          moveToNext();
        }
      });
    };
    
    moveToNext();
  }

  createUI() {
    this.moveText = this.add.text(600, 50, `Moves: ${this.moveCount}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.add.text(600, 100, 'Click to move', {
      fontSize: '18px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  updateUI() {
    this.moveText.setText(`Moves: ${this.moveCount}`);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);