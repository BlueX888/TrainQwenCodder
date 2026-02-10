class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerTileX = 1;
    this.playerTileY = 1;
    this.moveCount = 0; // 状态信号：移动次数
  }

  preload() {
    // 创建墙壁纹理
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x333333, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.lineStyle(2, 0x000000, 1);
    wallGraphics.strokeRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall', 32, 32);
    wallGraphics.destroy();

    // 创建地板纹理
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, 32, 32);
    floorGraphics.lineStyle(1, 0xaaaaaa, 0.5);
    floorGraphics.strokeRect(0, 0, 32, 32);
    floorGraphics.generateTexture('floor', 32, 32);
    floorGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 12);
    playerGraphics.lineStyle(2, 0x00aa00, 1);
    playerGraphics.strokeCircle(16, 16, 12);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
  }

  create() {
    // 定义 20x20 地图数据（0=空地，1=墙壁）
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

    // 创建 Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: 32,
      tileHeight: 32
    });

    // 添加 Tileset（使用我们创建的纹理）
    const tiles = map.addTilesetImage('wall', null, 32, 32, 0, 0);
    
    // 创建图层
    const layer = map.createLayer(0, tiles, 0, 0);

    // 为每个 tile 设置正确的纹理
    map.forEachTile(tile => {
      if (tile.index === 1) {
        // 墙壁保持默认
      } else if (tile.index === 0) {
        // 空地设置为地板纹理
        tile.index = -1; // 先清除
      }
    });

    // 重新绘制地图
    layer.destroy();
    
    // 使用两个图层：地板层和墙壁层
    const floorTiles = map.addTilesetImage('floor', null, 32, 32, 0, 0);
    const wallTiles = map.addTilesetImage('wall', null, 32, 32, 0, 0);
    
    // 创建地板层
    const floorLayer = map.createBlankLayer('floor', floorTiles, 0, 0);
    floorLayer.fill(0, 0, 0, 20, 20);
    
    // 创建墙壁层
    const wallLayer = map.createBlankLayer('walls', wallTiles, 0, 0);
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        if (mapData[y][x] === 1) {
          wallLayer.putTileAt(0, x, y);
        }
      }
    }

    // 设置墙壁碰撞
    wallLayer.setCollisionByExclusion([-1]);

    // 创建玩家（使用物理系统）
    this.player = this.physics.add.sprite(48, 48, 'player');
    this.player.setCollideWorldBounds(true);

    // 设置玩家与墙壁的碰撞
    this.physics.add.collider(this.player, wallLayer);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态文本显示
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    // 存储墙壁层供碰撞检测使用
    this.wallLayer = wallLayer;
    this.mapData = mapData;

    // 设置玩家速度为0（改用网格移动）
    this.player.setVelocity(0, 0);
    this.moveDelay = 0;
    this.moveSpeed = 150; // 移动间隔（毫秒）

    this.updateStatus();
  }

  update(time, delta) {
    this.moveDelay -= delta;

    if (this.moveDelay <= 0) {
      let moved = false;
      let newTileX = this.playerTileX;
      let newTileY = this.playerTileY;

      // 检测方向键输入
      if (this.cursors.left.isDown) {
        newTileX = this.playerTileX - 1;
        moved = true;
      } else if (this.cursors.right.isDown) {
        newTileX = this.playerTileX + 1;
        moved = true;
      } else if (this.cursors.up.isDown) {
        newTileY = this.playerTileY - 1;
        moved = true;
      } else if (this.cursors.down.isDown) {
        newTileY = this.playerTileY + 1;
        moved = true;
      }

      // 检查是否可以移动（不是墙壁）
      if (moved) {
        if (this.canMoveTo(newTileX, newTileY)) {
          this.playerTileX = newTileX;
          this.playerTileY = newTileY;
          this.moveCount++;

          // 平滑移动到新位置
          this.tweens.add({
            targets: this.player,
            x: this.playerTileX * 32 + 16,
            y: this.playerTileY * 32 + 16,
            duration: 100,
            ease: 'Linear'
          });

          this.moveDelay = this.moveSpeed;
          this.updateStatus();
        } else {
          // 撞墙，短暂延迟避免连续检测
          this.moveDelay = 100;
        }
      }
    }
  }

  canMoveTo(tileX, tileY) {
    // 检查边界
    if (tileX < 0 || tileX >= 20 || tileY < 0 || tileY >= 20) {
      return false;
    }
    // 检查是否是墙壁
    return this.mapData[tileY][tileX] === 0;
  }

  updateStatus() {
    this.statusText.setText(
      `Position: (${this.playerTileX}, ${this.playerTileY})\n` +
      `Moves: ${this.moveCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 640,
  height: 640,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);