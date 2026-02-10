class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 1;
    this.playerY = 1;
    this.moveCount = 0;
    this.isMoving = false;
    this.tileSize = 100;
    this.mapSize = 3;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建地面和障碍物纹理
    this.createTextures();
    
    // 创建地图数据
    this.createMapData();
    
    // 创建 Tilemap
    this.createTilemap();
    
    // 创建玩家
    this.createPlayer();
    
    // 添加点击事件
    this.input.on('pointerdown', this.handleClick, this);
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatus();
  }

  createTextures() {
    // 创建地面纹理（浅灰色）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0xcccccc, 1);
    groundGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    groundGraphics.lineStyle(2, 0x999999, 1);
    groundGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    groundGraphics.generateTexture('ground', this.tileSize, this.tileSize);
    groundGraphics.destroy();

    // 创建障碍物纹理（深灰色）
    const obstacleGraphics = this.add.graphics();
    obstacleGraphics.fillStyle(0x333333, 1);
    obstacleGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    obstacleGraphics.lineStyle(2, 0x000000, 1);
    obstacleGraphics.strokeRect(0, 0, this.tileSize, this.tileSize);
    obstacleGraphics.generateTexture('obstacle', this.tileSize, this.tileSize);
    obstacleGraphics.destroy();

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.lineStyle(3, 0xffffff, 1);
    playerGraphics.strokeCircle(this.tileSize / 2, this.tileSize / 2, this.tileSize / 3);
    playerGraphics.generateTexture('player', this.tileSize, this.tileSize);
    playerGraphics.destroy();
  }

  createMapData() {
    // 创建 3x3 地图，0=地面，1=障碍物
    this.mapData = [];
    for (let y = 0; y < this.mapSize; y++) {
      this.mapData[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        // 随机放置约 30% 的障碍物
        this.mapData[y][x] = Math.random() < 0.3 ? 1 : 0;
      }
    }
    
    // 确保玩家起始位置 (1,1) 和至少一些位置是可通行的
    this.mapData[1][1] = 0;
    this.mapData[0][0] = 0;
    this.mapData[2][2] = 0;
  }

  createTilemap() {
    // 使用 Tilemap 创建地图
    const map = this.make.tilemap({
      data: this.mapData,
      tileWidth: this.tileSize,
      tileHeight: this.tileSize
    });

    // 添加瓦片集
    const tiles = map.addTilesetImage('ground', null, this.tileSize, this.tileSize);
    
    // 创建图层
    this.groundLayer = map.createLayer(0, tiles, 50, 50);
    
    // 手动绘制地图（因为我们需要显示不同的纹理）
    this.tiles = [];
    for (let y = 0; y < this.mapSize; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.mapSize; x++) {
        const tileX = 50 + x * this.tileSize;
        const tileY = 50 + y * this.tileSize;
        const textureName = this.mapData[y][x] === 1 ? 'obstacle' : 'ground';
        const tile = this.add.image(tileX, tileY, textureName).setOrigin(0, 0);
        this.tiles[y][x] = tile;
      }
    }
  }

  createPlayer() {
    const playerScreenX = 50 + this.playerX * this.tileSize + this.tileSize / 2;
    const playerScreenY = 50 + this.playerY * this.tileSize + this.tileSize / 2;
    this.player = this.add.image(playerScreenX, playerScreenY, 'player');
  }

  handleClick(pointer) {
    if (this.isMoving) return;

    // 将屏幕坐标转换为地图坐标
    const tileX = Math.floor((pointer.x - 50) / this.tileSize);
    const tileY = Math.floor((pointer.y - 50) / this.tileSize);

    // 检查点击是否在地图范围内
    if (tileX < 0 || tileX >= this.mapSize || tileY < 0 || tileY >= this.mapSize) {
      return;
    }

    // 检查目标是否是障碍物
    if (this.mapData[tileY][tileX] === 1) {
      return;
    }

    // 使用 A* 寻路
    const path = this.findPath(this.playerX, this.playerY, tileX, tileY);
    
    if (path && path.length > 0) {
      this.moveAlongPath(path);
    }
  }

  findPath(startX, startY, endX, endY) {
    // A* 寻路算法实现
    const openList = [];
    const closedList = new Set();
    const cameFrom = new Map();

    const start = { x: startX, y: startY, g: 0, h: 0, f: 0 };
    openList.push(start);

    const getKey = (x, y) => `${x},${y}`;
    const heuristic = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

    while (openList.length > 0) {
      // 找到 f 值最小的节点
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift();

      if (current.x === endX && current.y === endY) {
        // 重建路径
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift({ x: temp.x, y: temp.y });
          temp = cameFrom.get(getKey(temp.x, temp.y));
        }
        return path.slice(1); // 移除起始点
      }

      closedList.add(getKey(current.x, current.y));

      // 检查四个方向的邻居
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const neighbor of neighbors) {
        const { x, y } = neighbor;

        // 检查是否在地图范围内
        if (x < 0 || x >= this.mapSize || y < 0 || y >= this.mapSize) continue;

        // 检查是否是障碍物
        if (this.mapData[y][x] === 1) continue;

        // 检查是否已经在关闭列表中
        if (closedList.has(getKey(x, y))) continue;

        const g = current.g + 1;
        const h = heuristic(x, y, endX, endY);
        const f = g + h;

        // 检查是否已经在开放列表中
        const existing = openList.find(node => node.x === x && node.y === y);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            cameFrom.set(getKey(x, y), current);
          }
        } else {
          openList.push({ x, y, g, h, f });
          cameFrom.set(getKey(x, y), current);
        }
      }
    }

    return null; // 没有找到路径
  }

  moveAlongPath(path) {
    this.isMoving = true;
    let index = 0;

    const moveNext = () => {
      if (index >= path.length) {
        this.isMoving = false;
        return;
      }

      const target = path[index];
      this.playerX = target.x;
      this.playerY = target.y;
      this.moveCount++;

      const targetScreenX = 50 + target.x * this.tileSize + this.tileSize / 2;
      const targetScreenY = 50 + target.y * this.tileSize + this.tileSize / 2;

      // 使用补间动画移动玩家
      this.tweens.add({
        targets: this.player,
        x: targetScreenX,
        y: targetScreenY,
        duration: 200,
        onComplete: () => {
          index++;
          this.updateStatus();
          moveNext();
        }
      });
    };

    moveNext();
  }

  updateStatus() {
    this.statusText.setText(
      `Position: (${this.playerX}, ${this.playerY}) | Moves: ${this.moveCount}`
    );
  }

  update(time, delta) {
    // 更新逻辑（如果需要）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 450,
  backgroundColor: '#222222',
  scene: GameScene
};

new Phaser.Game(config);