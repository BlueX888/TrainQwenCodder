// 10x10 Tilemap with Player Movement
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerMoves = 0;
    this.lastPosition = { x: 0, y: 0 };
  }

  preload() {
    // 创建瓦片纹理
    this.createTileTextures();
  }

  createTileTextures() {
    const tileSize = 32;
    
    // 空地纹理（浅灰色）
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, tileSize, tileSize);
    floorGraphics.lineStyle(1, 0x999999, 1);
    floorGraphics.strokeRect(0, 0, tileSize, tileSize);
    floorGraphics.generateTexture('floor', tileSize, tileSize);
    floorGraphics.destroy();
    
    // 墙壁纹理（深灰色）
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x333333, 1);
    wallGraphics.fillRect(0, 0, tileSize, tileSize);
    wallGraphics.lineStyle(2, 0x000000, 1);
    wallGraphics.strokeRect(0, 0, tileSize, tileSize);
    wallGraphics.generateTexture('wall', tileSize, tileSize);
    wallGraphics.destroy();
    
    // 玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 4);
    playerGraphics.lineStyle(2, 0x0044aa, 1);
    playerGraphics.strokeCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 4);
    playerGraphics.generateTexture('player', tileSize, tileSize);
    playerGraphics.destroy();
  }

  create() {
    const tileSize = 32;
    const mapWidth = 10;
    const mapHeight = 10;
    
    // 定义地图数据：0=空地，1=墙壁
    const mapData = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];
    
    // 创建Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: tileSize,
      tileHeight: tileSize
    });
    
    // 添加瓦片集
    const tiles = map.addTilesetImage('tiles', null, tileSize, tileSize, 0, 0);
    
    // 创建图层
    const layer = map.createLayer(0, tiles, 0, 0);
    
    // 手动设置瓦片纹理
    layer.forEachTile(tile => {
      if (tile.index === 0) {
        tile.setAlpha(0); // 空地透明
      } else if (tile.index === 1) {
        // 墙壁使用默认显示
      }
    });
    
    // 使用Graphics绘制地图（因为Tilemap纹理映射限制）
    this.mapGraphics = this.add.graphics();
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        const tileValue = mapData[y][x];
        if (tileValue === 0) {
          // 空地
          this.mapGraphics.fillStyle(0xcccccc, 1);
          this.mapGraphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          this.mapGraphics.lineStyle(1, 0x999999, 1);
          this.mapGraphics.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        } else if (tileValue === 1) {
          // 墙壁
          this.mapGraphics.fillStyle(0x333333, 1);
          this.mapGraphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          this.mapGraphics.lineStyle(2, 0x000000, 1);
          this.mapGraphics.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }
    
    // 设置碰撞（瓦片索引1为墙壁）
    layer.setCollisionByExclusion([0]);
    
    // 启用物理系统
    this.physics.world.setBounds(0, 0, mapWidth * tileSize, mapHeight * tileSize);
    
    // 创建玩家（起始位置：1,1）
    this.player = this.physics.add.sprite(tileSize * 1.5, tileSize * 1.5, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(tileSize - 8, tileSize - 8);
    
    // 设置玩家与地图的碰撞
    this.physics.add.collider(this.player, layer);
    
    // 保存地图引用用于碰撞检测
    this.mapData = mapData;
    this.tileSize = tileSize;
    this.layer = layer;
    
    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加WASD键支持
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 初始化状态信号
    this.updateSignals();
    
    // 添加信息文本
    this.infoText = this.add.text(10, mapHeight * tileSize + 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.updateInfoText();
    
    console.log('Game initialized. Use arrow keys or WASD to move.');
  }

  update(time, delta) {
    const speed = 150;
    
    // 重置速度
    this.player.setVelocity(0);
    
    // 检测输入并移动
    let moved = false;
    
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-speed);
      moved = true;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(speed);
      moved = true;
    }
    
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-speed);
      moved = true;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(speed);
      moved = true;
    }
    
    // 检测位置变化
    const currentTileX = Math.floor(this.player.x / this.tileSize);
    const currentTileY = Math.floor(this.player.y / this.tileSize);
    const lastTileX = Math.floor(this.lastPosition.x / this.tileSize);
    const lastTileY = Math.floor(this.lastPosition.y / this.tileSize);
    
    if (currentTileX !== lastTileX || currentTileY !== lastTileY) {
      this.playerMoves++;
      this.lastPosition = { x: this.player.x, y: this.player.y };
      this.updateSignals();
      this.updateInfoText();
    }
  }

  updateSignals() {
    const tileX = Math.floor(this.player.x / this.tileSize);
    const tileY = Math.floor(this.player.y / this.tileSize);
    
    window.__signals__ = {
      playerPosition: {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      },
      playerTilePosition: {
        x: tileX,
        y: tileY
      },
      playerMoves: this.playerMoves,
      currentTile: this.mapData[tileY] ? this.mapData[tileY][tileX] : -1,
      timestamp: Date.now()
    };
    
    // 输出JSON日志
    console.log(JSON.stringify({
      event: 'player_update',
      data: window.__signals__
    }));
  }

  updateInfoText() {
    const tileX = Math.floor(this.player.x / this.tileSize);
    const tileY = Math.floor(this.player.y / this.tileSize);
    
    this.infoText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Tile: (${tileX}, ${tileY})`,
      `Moves: ${this.playerMoves}`,
      `Controls: Arrow Keys or WASD`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 360,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号
window.__signals__ = {
  playerPosition: { x: 0, y: 0 },
  playerTilePosition: { x: 0, y: 0 },
  playerMoves: 0,
  currentTile: 0,
  timestamp: 0
};