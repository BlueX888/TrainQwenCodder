class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.layer = null;
    
    // 可验证的状态信号
    window.__signals__ = {
      playerPosition: { x: 0, y: 0 },
      movementCount: 0,
      collisionCount: 0,
      mapData: null
    };
  }

  preload() {
    // 使用Graphics创建tile纹理
    this.createTileTextures();
  }

  createTileTextures() {
    // 创建地板纹理（浅灰色）
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xcccccc, 1);
    floorGraphics.fillRect(0, 0, 32, 32);
    floorGraphics.lineStyle(1, 0x999999, 1);
    floorGraphics.strokeRect(0, 0, 32, 32);
    floorGraphics.generateTexture('floor', 32, 32);
    floorGraphics.destroy();

    // 创建墙纹理（深灰色）
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x333333, 1);
    wallGraphics.fillRect(0, 0, 32, 32);
    wallGraphics.lineStyle(2, 0x000000, 1);
    wallGraphics.strokeRect(0, 0, 32, 32);
    wallGraphics.generateTexture('wall', 32, 32);
    wallGraphics.destroy();

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillCircle(16, 16, 12);
    playerGraphics.lineStyle(2, 0x0000aa, 1);
    playerGraphics.strokeCircle(16, 16, 12);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();
  }

  create() {
    // 5x5地图数据：0=空地，1=墙
    const mapData = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1]
    ];

    // 保存地图数据到信号
    window.__signals__.mapData = mapData;

    // 创建Tilemap
    const map = this.make.tilemap({
      data: mapData,
      tileWidth: 32,
      tileHeight: 32
    });

    // 添加tileset（使用我们创建的纹理）
    const tiles = map.addTilesetImage('floor', 'floor');
    
    // 创建layer
    this.layer = map.createLayer(0, tiles, 100, 100);

    // 手动设置墙的纹理和碰撞
    map.forEachTile((tile) => {
      if (tile.index === 1) {
        // 墙tile，设置为碰撞
        tile.setCollision(true, true, true, true);
        // 更改纹理为墙
        this.add.image(
          tile.pixelX + 100 + 16,
          tile.pixelY + 100 + 16,
          'wall'
        );
      }
    });

    // 设置碰撞（index 1 为墙）
    this.layer.setCollisionByProperty({ collides: true });
    this.layer.setCollision(1);

    // 创建玩家（起始位置：第2行第2列，即索引[1,1]）
    const startX = 100 + 32 * 1 + 16; // 100偏移 + 1格 + 半格居中
    const startY = 100 + 32 * 1 + 16;
    
    this.player = this.physics.add.sprite(startX, startY, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(24, 24); // 设置碰撞体积小一点，更容易操作

    // 设置玩家与tilemap的碰撞
    this.physics.add.collider(this.player, this.layer, () => {
      window.__signals__.collisionCount++;
      console.log(JSON.stringify({
        event: 'collision',
        count: window.__signals__.collisionCount,
        position: window.__signals__.playerPosition
      }));
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 更新初始位置信号
    this.updatePlayerSignal();

    // 添加文本显示
    this.add.text(10, 10, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    this.statusText = this.add.text(10, 40, '', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    console.log(JSON.stringify({
      event: 'game_start',
      mapSize: '5x5',
      playerStart: { x: startX, y: startY }
    }));
  }

  update() {
    if (!this.player || !this.cursors) return;

    const speed = 150;
    let moved = false;

    // 重置速度
    this.player.setVelocity(0);

    // 处理方向键输入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
      moved = true;
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
      moved = true;
    }

    // 更新移动计数
    if (moved && (this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0)) {
      window.__signals__.movementCount++;
    }

    // 更新玩家位置信号
    this.updatePlayerSignal();

    // 更新状态文本
    this.statusText.setText(
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Moves: ${window.__signals__.movementCount}\n` +
      `Collisions: ${window.__signals__.collisionCount}`
    );
  }

  updatePlayerSignal() {
    const tileX = Math.floor((this.player.x - 100) / 32);
    const tileY = Math.floor((this.player.y - 100) / 32);
    
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      tileX: tileX,
      tileY: tileY
    };
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
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

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log(JSON.stringify({
  event: 'init',
  signals: window.__signals__
}));