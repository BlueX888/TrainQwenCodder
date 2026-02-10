class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerTileX = 1;
    this.playerTileY = 1;
    this.moveCount = 0; // 可验证状态：移动次数
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
    floorGraphics.lineStyle(1, 0x999999, 0.5);
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
    // 15x15 地图数据（0=空地，1=墙壁）
    const mapData = [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];

    // 创建空白 Tilemap
    const map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: 15,
      height: 15
    });

    // 添加 Tileset
    const tiles = map.addTilesetImage('tiles', null, 32, 32, 0, 0);
    
    // 创建图层
    const layer = map.createBlankLayer('ground', tiles);

    // 填充地图数据
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const tileIndex = mapData[y][x];
        if (tileIndex === 1) {
          const tile = layer.putTileAt(1, x, y);
          tile.setCollision(true); // 设置墙壁碰撞
        } else {
          layer.putTileAt(0, x, y);
        }
      }
    }

    // 手动设置瓦片纹理
    layer.forEachTile(tile => {
      if (tile.index === 1) {
        tile.tint = 0x333333; // 墙壁颜色
      } else {
        tile.tint = 0xcccccc; // 地板颜色
      }
    });

    // 设置图层碰撞（所有 index=1 的瓦片）
    layer.setCollisionByProperty({ collides: true });
    layer.setCollision(1);

    // 创建玩家（物理精灵）
    this.player = this.physics.add.sprite(
      this.playerTileX * 32 + 16,
      this.playerTileY * 32 + 16,
      'player'
    );
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24); // 设置碰撞体积

    // 设置玩家与地图碰撞
    this.physics.add.collider(this.player, layer);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加移动冷却（防止过快移动）
    this.canMove = true;
    this.moveDelay = 150; // 毫秒

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatus();

    // 保存图层引用
    this.groundLayer = layer;
  }

  update(time, delta) {
    if (!this.canMove) return;

    let velocityX = 0;
    let velocityY = 0;
    let moved = false;

    // 检测按键并设置速度
    if (this.cursors.left.isDown) {
      velocityX = -200;
      moved = true;
    } else if (this.cursors.right.isDown) {
      velocityX = 200;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      velocityY = -200;
      moved = true;
    } else if (this.cursors.down.isDown) {
      velocityY = 200;
      moved = true;
    }

    // 设置玩家速度
    this.player.setVelocity(velocityX, velocityY);

    // 如果有移动，启动冷却
    if (moved) {
      this.canMove = false;
      this.moveCount++;
      this.updateStatus();

      // 冷却结束后停止玩家并允许下次移动
      this.time.delayedCall(this.moveDelay, () => {
        this.player.setVelocity(0, 0);
        this.canMove = true;
        
        // 更新玩家瓦片位置
        this.playerTileX = Math.floor(this.player.x / 32);
        this.playerTileY = Math.floor(this.player.y / 32);
        this.updateStatus();
      });
    }
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
  width: 480,
  height: 480,
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

new Phaser.Game(config);