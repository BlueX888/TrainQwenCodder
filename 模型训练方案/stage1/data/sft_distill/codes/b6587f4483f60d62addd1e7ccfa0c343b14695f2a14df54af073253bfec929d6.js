class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveCount = 0;
    this.playerGridX = 1;
    this.playerGridY = 1;
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

    // 创建空地纹理
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xeeeeee, 1);
    floorGraphics.fillRect(0, 0, 32, 32);
    floorGraphics.lineStyle(1, 0xcccccc, 1);
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
    // 10x10 地图数据：0=空地，1=墙
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

    // 创建 Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: 32,
      tileHeight: 32
    });

    // 添加 tileset（使用我们生成的纹理）
    const tiles = map.addTilesetImage('floor', 'floor');
    
    // 创建图层
    const layer = map.createLayer(0, tiles, 0, 0);

    // 手动渲染墙壁（因为 tilemap data 只能用单一 tileset）
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        if (mapData[y][x] === 1) {
          const wall = this.add.image(x * 32 + 16, y * 32 + 16, 'wall');
          // 为墙壁添加物理体
          this.physics.add.existing(wall, true); // true = static body
        }
      }
    }

    // 创建玩家（起始位置在 (1,1) 即第二行第二列）
    this.player = this.physics.add.sprite(1 * 32 + 16, 1 * 32 + 16, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24); // 稍小的碰撞体积，便于通过狭窄通道

    // 设置碰撞
    this.physics.add.collider(this.player, this.physics.world.staticBodies.getArray());

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 用于控制移动速度
    this.moveSpeed = 100;
    this.lastMoveTime = 0;
    this.moveDelay = 150; // 移动间隔（毫秒）

    // 添加信息文本
    this.infoText = this.add.text(10, 330, '', {
      fontSize: '14px',
      fill: '#000',
      backgroundColor: '#fff',
      padding: { x: 5, y: 5 }
    });

    // 初始化状态信号
    this.updateSignals();

    console.log('Game initialized - Use arrow keys to move');
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    let moved = false;
    const currentGridX = Math.floor(this.player.x / 32);
    const currentGridY = Math.floor(this.player.y / 32);

    // 限制移动频率，避免过快移动
    if (time - this.lastMoveTime > this.moveDelay) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-this.moveSpeed);
        moved = true;
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(this.moveSpeed);
        moved = true;
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-this.moveSpeed);
        moved = true;
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(this.moveSpeed);
        moved = true;
      }

      if (moved) {
        this.lastMoveTime = time;
        this.moveCount++;
      }
    }

    // 检测网格位置变化
    const newGridX = Math.floor(this.player.x / 32);
    const newGridY = Math.floor(this.player.y / 32);

    if (newGridX !== this.playerGridX || newGridY !== this.playerGridY) {
      this.playerGridX = newGridX;
      this.playerGridY = newGridY;
      this.updateSignals();
    }

    // 更新信息显示
    this.infoText.setText(
      `Position: (${this.playerGridX}, ${this.playerGridY})\n` +
      `Moves: ${this.moveCount}\n` +
      `Pixel: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }

  updateSignals() {
    // 输出可验证的状态信号
    window.__signals__ = {
      playerGridX: this.playerGridX,
      playerGridY: this.playerGridY,
      playerPixelX: Math.round(this.player.x),
      playerPixelY: Math.round(this.player.y),
      moveCount: this.moveCount,
      timestamp: Date.now()
    };

    // 同时输出 JSON 日志
    console.log(JSON.stringify({
      type: 'PLAYER_POSITION',
      grid: { x: this.playerGridX, y: this.playerGridY },
      pixel: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
      moveCount: this.moveCount
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 360,
  backgroundColor: '#ffffff',
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