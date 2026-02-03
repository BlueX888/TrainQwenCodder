class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号：玩家位置（用于验证）
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 创建墙体纹理（红色方块）
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x8b4513, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall', 32, 32);
    wallGraphics.destroy();

    // 创建地板纹理（灰色方块）
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, 32, 32);
    floorGraphics.generateTexture('floor', 32, 32);
    floorGraphics.destroy();

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillCircle(16, 16, 12);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
  }

  create() {
    // 定义20x20地图数据（0=空，1=墙）
    const mapData = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,0,1,1,1,0,0,0,0,1,1,1,0,1,1,0,1],
      [1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,0,1,0,0,0,0,1,0,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,0,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,1,0,1,0,0,0,0,1,0,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,1],
      [1,0,1,1,0,1,1,1,0,0,0,0,1,1,1,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    const tileSize = 32;
    const mapWidth = 20;
    const mapHeight = 20;

    // 创建空白Tilemap
    const map = this.make.tilemap({
      tileWidth: tileSize,
      tileHeight: tileSize,
      width: mapWidth,
      height: mapHeight
    });

    // 添加tileset（使用生成的纹理）
    const tiles = map.addTilesetImage('floor');
    
    // 创建图层
    const layer = map.createBlankLayer('ground', tiles, 0, 0);

    // 填充地图数据
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (mapData[y][x] === 1) {
          // 墙体：使用wall纹理
          const tile = layer.putTileAt(-1, x, y);
          layer.removeTileAt(x, y);
          
          // 手动创建墙体精灵（因为tilemap纹理限制）
          const wall = this.add.image(x * tileSize + 16, y * tileSize + 16, 'wall');
          wall.setOrigin(0.5);
        } else {
          // 地板
          const tile = layer.putTileAt(0, x, y);
        }
      }
    }

    // 由于Graphics生成的纹理在Tilemap中使用有限制，改用物理组管理墙体
    this.walls = this.physics.add.staticGroup();
    
    for (let y = 0; y < mapHeight; y++) {
      for (let x = 0; x < mapWidth; x++) {
        if (mapData[y][x] === 1) {
          const wall = this.walls.create(x * tileSize + 16, y * tileSize + 16, 'wall');
          wall.setOrigin(0.5);
          wall.refreshBody();
        }
      }
    }

    // 创建玩家（起始位置在安全区域）
    this.player = this.physics.add.sprite(1.5 * tileSize, 1.5 * tileSize, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24);

    // 设置玩家与墙体的碰撞
    this.physics.add.collider(this.player, this.walls);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 玩家移动速度
    this.playerSpeed = 160;

    // 更新状态信号
    this.updatePlayerPosition();

    // 添加调试文本显示玩家位置
    this.positionText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.positionText.setScrollFactor(0);
    this.positionText.setDepth(1000);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理方向键输入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 更新状态信号
    this.updatePlayerPosition();

    // 更新显示文本
    this.positionText.setText(
      `Player Position: (${this.playerX}, ${this.playerY})\n` +
      `Tile: (${Math.floor(this.player.x / 32)}, ${Math.floor(this.player.y / 32)})`
    );
  }

  updatePlayerPosition() {
    // 更新状态信号（精确到整数像素）
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);