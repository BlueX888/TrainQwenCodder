class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0; // 可验证的状态信号：移动次数
    this.playerGridX = 1; // 可验证的状态信号：玩家网格X坐标
    this.playerGridY = 1; // 可验证的状态信号：玩家网格Y坐标
  }

  preload() {
    // 创建空地纹理（浅灰色）
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, 64, 64);
    floorGraphics.lineStyle(2, 0x999999, 1);
    floorGraphics.strokeRect(0, 0, 64, 64);
    floorGraphics.generateTexture('floor', 64, 64);
    floorGraphics.destroy();

    // 创建墙纹理（深灰色）
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x333333, 1);
    wallGraphics.fillRect(0, 0, 64, 64);
    wallGraphics.lineStyle(2, 0x000000, 1);
    wallGraphics.strokeRect(0, 0, 64, 64);
    wallGraphics.generateTexture('wall', 64, 64);
    wallGraphics.destroy();

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillCircle(28, 28, 24);
    playerGraphics.lineStyle(3, 0x0044cc, 1);
    playerGraphics.strokeCircle(28, 28, 24);
    playerGraphics.generateTexture('player', 56, 56);
    playerGraphics.destroy();
  }

  create() {
    // 定义8x8地图数据（0=空地，1=墙）
    const mapData = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ];

    // 创建Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: 64,
      tileHeight: 64
    });

    // 添加瓦片集
    const tiles = map.addTilesetImage('tiles', null, 64, 64, 0, 0);
    
    // 手动设置瓦片纹理
    map.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.index === 0) {
          this.add.image(x * 64 + 32, y * 64 + 32, 'floor');
        } else if (tile.index === 1) {
          this.add.image(x * 64 + 32, y * 64 + 32, 'wall');
        }
      });
    });

    // 创建图层（用于碰撞检测）
    const layer = map.createLayer(0, tiles, 0, 0);
    
    // 设置索引为1的瓦片（墙）为可碰撞
    layer.setCollisionByProperty({ collides: true });
    map.setCollision(1);

    // 创建玩家
    this.player = this.physics.add.sprite(96, 96, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(48, 48);
    this.player.setDepth(10);

    // 设置玩家与地图图层的碰撞
    this.physics.add.collider(this.player, layer);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD键支持
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(16, 520, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setDepth(100);

    this.updateStatus();

    // 添加说明文字
    this.add.text(16, 16, 'Use Arrow Keys or WASD to move', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    }).setDepth(100);
  }

  update(time, delta) {
    const speed = 200;
    
    // 重置速度
    this.player.setVelocity(0);

    let moved = false;

    // 处理左右移动
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      this.player.setVelocityX(-speed);
      moved = true;
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      this.player.setVelocityX(speed);
      moved = true;
    }

    // 处理上下移动
    if (this.cursors.up.isDown || this.keys.up.isDown) {
      this.player.setVelocityY(-speed);
      moved = true;
    } else if (this.cursors.down.isDown || this.keys.down.isDown) {
      this.player.setVelocityY(speed);
      moved = true;
    }

    // 更新玩家网格位置
    const newGridX = Math.floor(this.player.x / 64);
    const newGridY = Math.floor(this.player.y / 64);

    if (newGridX !== this.playerGridX || newGridY !== this.playerGridY) {
      this.playerGridX = newGridX;
      this.playerGridY = newGridY;
      this.moveCount++;
      this.updateStatus();
    }
  }

  updateStatus() {
    this.statusText.setText(
      `Position: (${this.playerGridX}, ${this.playerGridY}) | Moves: ${this.moveCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 512,
  height: 560,
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