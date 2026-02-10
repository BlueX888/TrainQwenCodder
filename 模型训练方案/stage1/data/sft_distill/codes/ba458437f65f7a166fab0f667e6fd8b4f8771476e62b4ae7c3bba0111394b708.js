class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.collisionCount = 0; // 可验证的状态信号
  }

  preload() {
    // 程序化生成纹理
    this.createTextures();
  }

  createTextures() {
    // 创建墙体纹理（32x32 灰色方块）
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x666666, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.lineStyle(2, 0x333333, 1);
    wallGraphics.strokeRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall', 32, 32);
    wallGraphics.destroy();

    // 创建地板纹理（32x32 浅色方块）
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, 32, 32);
    floorGraphics.lineStyle(1, 0xaaaaaa, 0.5);
    floorGraphics.strokeRect(0, 0, 32, 32);
    floorGraphics.generateTexture('floor', 32, 32);
    floorGraphics.destroy();

    // 创建玩家纹理（28x28 蓝色圆形，留出边距）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillCircle(16, 16, 14);
    playerGraphics.lineStyle(2, 0x003399, 1);
    playerGraphics.strokeCircle(16, 16, 14);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
  }

  create() {
    // 3x3 地图数据：0=地板，1=墙
    const mapData = [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1]
    ];

    // 创建 Tilemap（使用空白地图）
    const map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: 3,
      height: 3
    });

    // 添加 Tileset（使用生成的纹理）
    const tileset = map.addTilesetImage('tiles', null, 32, 32, 0, 0);
    
    // 创建图层
    const layer = map.createBlankLayer('ground', tileset, 100, 100);

    // 填充地图数据
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const tileIndex = mapData[y][x];
        if (tileIndex === 1) {
          // 墙体
          const tile = layer.putTileAt(0, x, y);
          tile.setCollision(true); // 设置碰撞
        } else {
          // 地板（可选，用于视觉效果）
          layer.putTileAt(-1, x, y); // -1 表示空 tile
        }
      }
    }

    // 手动绘制地板和墙体（因为 Tilemap 纹理需要特殊处理）
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        const posX = 100 + x * 32;
        const posY = 100 + y * 32;
        
        if (mapData[y][x] === 1) {
          // 绘制墙体
          this.add.image(posX, posY, 'wall').setOrigin(0, 0);
        } else {
          // 绘制地板
          this.add.image(posX, posY, 'floor').setOrigin(0, 0);
        }
      }
    }

    // 设置碰撞层（对整个图层启用碰撞）
    layer.setCollisionByProperty({ collides: true });

    // 创建玩家（初始位置在中心 tile）
    this.player = this.physics.add.sprite(116, 116, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28); // 设置碰撞体积稍小于纹理
    this.player.setDepth(10); // 确保玩家在地图上层

    // 设置玩家与地图层的碰撞
    this.physics.add.collider(this.player, layer, this.onCollision, null, this);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 250, 'Use Arrow Keys or WASD to move\nCannot pass through walls', {
      fontSize: '12px',
      fill: '#333333'
    });

    this.updateStatus();
  }

  onCollision(player, tile) {
    // 碰撞回调
    this.collisionCount++;
    this.updateStatus();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    const speed = 100;

    // 方向键控制
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(speed);
    }

    // 更新玩家在网格中的位置（用于状态信号）
    const gridX = Math.floor((this.player.x - 100) / 32);
    const gridY = Math.floor((this.player.y - 100) / 32);
    
    if (gridX !== this.playerX || gridY !== this.playerY) {
      this.playerX = gridX;
      this.playerY = gridY;
      this.updateStatus();
    }
  }

  updateStatus() {
    // 更新状态显示（可验证的状态信号）
    this.statusText.setText(
      `Player Grid: (${this.playerX}, ${this.playerY})\n` +
      `Collisions: ${this.collisionCount}\n` +
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 400,
  height: 300,
  backgroundColor: '#eeeeee',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);