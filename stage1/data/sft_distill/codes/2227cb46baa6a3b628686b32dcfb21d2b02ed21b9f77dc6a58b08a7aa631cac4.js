class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.moveCount = 0; // 状态信号：移动次数
  }

  preload() {
    // 创建墙壁纹理
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x555555, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.lineStyle(2, 0x333333, 1);
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
    // 12x12 地图数据（0=空地，1=墙壁）
    const mapData = [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    // 创建空白 Tilemap
    const map = this.make.tilemap({
      tileWidth: 32,
      tileHeight: 32,
      width: 12,
      height: 12
    });

    // 添加 Tileset
    const tiles = map.addTilesetImage('tiles', null, 32, 32, 0, 0);
    
    // 创建图层
    const layer = map.createBlankLayer('ground', tiles);

    // 填充地图数据
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 12; x++) {
        if (mapData[y][x] === 1) {
          // 墙壁
          const tile = layer.putTileAt(1, x, y);
          tile.setCollision(true);
        } else {
          // 地板
          layer.putTileAt(0, x, y);
        }
      }
    }

    // 手动设置瓦片纹理（因为我们使用自定义纹理）
    layer.forEachTile(tile => {
      if (tile.index === 1) {
        // 创建墙壁精灵
        const wall = this.add.image(tile.pixelX + 16, tile.pixelY + 16, 'wall');
        wall.setOrigin(0.5);
      } else if (tile.index === 0) {
        // 创建地板精灵
        const floor = this.add.image(tile.pixelX + 16, tile.pixelY + 16, 'floor');
        floor.setOrigin(0.5);
      }
    });

    // 设置碰撞
    layer.setCollisionByProperty({ collides: true });
    layer.setCollisionBetween(1, 1);

    // 创建玩家（起始位置在 1,1）
    this.player = this.physics.add.sprite(1 * 32 + 16, 1 * 32 + 16, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24);
    
    // 更新玩家位置状态
    this.playerX = 1;
    this.playerY = 1;

    // 设置物理碰撞
    this.physics.add.collider(this.player, layer);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 移动速度
    this.moveSpeed = 150;

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0);
    this.statusText.setDepth(100);

    this.updateStatusText();

    // 存储地图引用用于碰撞检测
    this.mapData = mapData;
    this.tileLayer = layer;
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    let moved = false;
    let targetX = this.playerX;
    let targetY = this.playerY;

    // 处理输入
    if (this.cursors.left.isDown) {
      targetX = this.playerX - 1;
      this.player.setVelocityX(-this.moveSpeed);
      moved = true;
    } else if (this.cursors.right.isDown) {
      targetX = this.playerX + 1;
      this.player.setVelocityX(this.moveSpeed);
      moved = true;
    }

    if (this.cursors.up.isDown) {
      targetY = this.playerY - 1;
      this.player.setVelocityY(-this.moveSpeed);
      moved = true;
    } else if (this.cursors.down.isDown) {
      targetY = this.playerY + 1;
      this.player.setVelocityY(this.moveSpeed);
      moved = true;
    }

    // 检查目标位置是否可以移动
    if (moved) {
      // 确保在地图范围内
      if (targetX >= 0 && targetX < 12 && targetY >= 0 && targetY < 12) {
        // 检查是否是墙壁
        if (this.mapData[targetY][targetX] === 1) {
          // 是墙壁，停止移动
          this.player.setVelocity(0);
        } else {
          // 检查玩家是否移动到了新的格子
          const currentGridX = Math.floor(this.player.x / 32);
          const currentGridY = Math.floor(this.player.y / 32);
          
          if (currentGridX !== this.playerX || currentGridY !== this.playerY) {
            this.playerX = currentGridX;
            this.playerY = currentGridY;
            this.moveCount++;
            this.updateStatusText();
          }
        }
      } else {
        // 超出边界，停止移动
        this.player.setVelocity(0);
      }
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Position: (${this.playerX}, ${this.playerY})\n` +
      `Moves: ${this.moveCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 384,  // 12 * 32
  height: 384, // 12 * 32
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

const game = new Phaser.Game(config);