class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapSize = 8;
    this.tileSize = 64;
    this.obstacleRate = 0.3;
    this.moveCount = 0; // 状态信号：移动次数
    this.playerTileX = 0; // 状态信号：玩家位置
    this.playerTileY = 0;
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建地板纹理
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    floorGraphics.lineStyle(2, 0x999999, 1);
    floorGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    floorGraphics.generateTexture('floor', this.tileSize, this.tileSize);
    floorGraphics.destroy();

    // 创建障碍物纹理
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x333333, 1);
    wallGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    wallGraphics.lineStyle(2, 0x000000, 1);
    wallGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    wallGraphics.generateTexture('wall', this.tileSize, this.tileSize);
    wallGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.lineStyle(3, 0x00aa00, 1);
    playerGraphics.strokeCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();

    // 创建路径标记纹理
    const pathGraphics = this.add.graphics();
    pathGraphics.fillStyle(0xffff00, 0.5);
    pathGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 6);
    pathGraphics.generateTexture('path', this.tileSize, this.tileSize);
    pathGraphics.destroy();
  }

  create() {
    // 初始化地图数据
    this.mapData = this.generateMap();

    // 渲染地图
    this.renderMap();

    // 创建玩家
    this.player = this.add.sprite(
      this.tileSize / 2,
      this.tileSize / 2,
      'player'
    );

    // 创建UI文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 监听点击事件
    this.input.on('pointerdown', this.handleClick, this);

    // 路径标记组
    this.pathMarkers = this.add.group();
  }

  generateMap() {
    const map = [];
    for (let y = 0; y < this.mapSize; y++) {
      map[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        // 起点不放障碍
        if (x === 0 && y === 0) {
          map[y][x] = 0;
        } else {
          map[y][x] = Math.random() < this.obstacleRate ? 1 : 0;
        }
      }
    }
    return map;
  }

  renderMap() {
    this.tiles = [];
    for (let y = 0; y < this.mapSize; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        const texture = this.mapData[y][x] === 1 ? 'wall' : 'floor';
        const tile = this.add.sprite(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          texture
        );
        this.tiles[y][x] = tile;
      }
    }
  }

  handleClick(pointer) {
    const tileX = Math.floor(pointer.x / this.tileSize);
    const tileY = Math.floor(pointer.y / this.tileSize);

    // 检查点击是否在地图范围内
    if (tileX < 0 || tileX >= this.mapSize || tileY < 0 || tileY >= this.mapSize) {
      return;
    }

    // 检查目标是否是障碍
    if (this.mapData[tileY][tileX] === 1) {
      return;
    }

    // 寻路
    const path = this.findPath(
      { x: this.playerTileX, y: this.playerTileY },
      { x: tileX, y: tileY }
    );

    if (path && path.length > 0) {
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
      // 找到 f 值最小的节点
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

      // 移到关闭列表
      openList.splice(currentIndex, 1);
      closedList.push(current);

      // 检查邻居
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        // 跳过已在关闭列表中的节点
        if (closedList.find(n => n.x === neighbor.x && n.y === neighbor.y)) {
          continue;
        }

        const g = current.g + 1;
        const existing = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

        if (!existing) {
          const h = this.heuristic(neighbor, end);
          openList.push({
            x: neighbor.x,
            y: neighbor.y,
            g: g,
            h: h,
            f: g + h,
            parent: current
          });
        } else if (g < existing.g) {
          existing.g = g;
          existing.f = g + existing.h;
          existing.parent = current;
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
      const x = node.x + dir.x;
      const y = node.y + dir.y;

      if (x >= 0 && x < this.mapSize && y >= 0 && y < this.mapSize) {
        if (this.mapData[y][x] === 0) {
          neighbors.push({ x, y });
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

  moveAlongPath(path) {
    // 清除旧的路径标记
    this.pathMarkers.clear(true, true);

    // 显示路径
    for (const point of path) {
      const marker = this.add.sprite(
        point.x * this.tileSize + this.tileSize / 2,
        point.y * this.tileSize + this.tileSize / 2,
        'path'
      );
      this.pathMarkers.add(marker);
    }

    // 移动玩家
    let index = 0;
    const moveNext = () => {
      if (index < path.length) {
        const point = path[index];
        this.tweens.add({
          targets: this.player,
          x: point.x * this.tileSize + this.tileSize / 2,
          y: point.y * this.tileSize + this.tileSize / 2,
          duration: 200,
          onComplete: () => {
            this.playerTileX = point.x;
            this.playerTileY = point.y;
            this.moveCount++;
            this.updateStatusText();
            index++;
            moveNext();
          }
        });
      } else {
        // 移动完成，清除路径标记
        this.time.delayedCall(300, () => {
          this.pathMarkers.clear(true, true);
        });
      }
    };
    moveNext();
  }

  updateStatusText() {
    this.statusText.setText(
      `Position: (${this.playerTileX}, ${this.playerTileY}) | Moves: ${this.moveCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 512,
  height: 512,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);