class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.map = null;
    this.layer = null;
    
    // 可验证的状态信号
    window.__signals__ = {
      playerX: 0,
      playerY: 0,
      tileX: 0,
      tileY: 0,
      canMoveUp: true,
      canMoveDown: true,
      canMoveLeft: true,
      canMoveRight: true,
      collisionCount: 0
    };
  }

  preload() {
    // 创建墙壁纹理（红色）
    const wallGraphics = this.add.graphics();
    wallGraphics.fillStyle(0x8B4513, 1);
    wallGraphics.fillRect(0, 0, 64, 64);
    wallGraphics.lineStyle(2, 0x654321, 1);
    wallGraphics.strokeRect(0, 0, 64, 64);
    wallGraphics.generateTexture('wall', 64, 64);
    wallGraphics.destroy();

    // 创建地板纹理（灰色）
    const floorGraphics = this.add.graphics();
    floorGraphics.fillStyle(0xCCCCCC, 1);
    floorGraphics.fillRect(0, 0, 64, 64);
    floorGraphics.lineStyle(1, 0x999999, 0.5);
    floorGraphics.strokeRect(0, 0, 64, 64);
    floorGraphics.generateTexture('floor', 64, 64);
    floorGraphics.destroy();

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000FF, 1);
    playerGraphics.fillCircle(24, 24, 20);
    playerGraphics.lineStyle(2, 0x0000AA, 1);
    playerGraphics.strokeCircle(24, 24, 20);
    playerGraphics.generateTexture('player', 48, 48);
    playerGraphics.destroy();
  }

  create() {
    // 5x5 地图数据：0=空地，1=墙
    const mapData = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1]
    ];

    // 创建 Tilemap
    this.map = this.make.tilemap({
      data: mapData,
      tileWidth: 64,
      tileHeight: 64
    });

    // 添加 Tileset（使用我们创建的纹理）
    const tiles = this.map.addTilesetImage('floor', null, 64, 64, 0, 0);
    
    // 创建图层
    this.layer = this.map.createLayer(0, tiles, 0, 0);

    // 手动设置每个 tile 的纹理
    this.map.forEachTile(tile => {
      if (tile.index === 1) {
        // 墙壁
        tile.setCollision(true);
        const wallSprite = this.add.image(
          tile.pixelX + 32,
          tile.pixelY + 32,
          'wall'
        ).setOrigin(0.5);
      } else {
        // 地板
        const floorSprite = this.add.image(
          tile.pixelX + 32,
          tile.pixelY + 32,
          'floor'
        ).setOrigin(0.5);
      }
    });

    // 设置碰撞（tile index 1 为墙）
    this.layer.setCollisionByProperty({ collides: true });
    this.map.setCollision(1);

    // 创建玩家（起始位置在 tile [1,1]）
    this.player = this.physics.add.sprite(96, 96, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);
    
    // 设置玩家与 tilemap 的碰撞
    this.physics.add.collider(this.player, this.layer, () => {
      window.__signals__.collisionCount++;
      console.log('Collision detected! Count:', window.__signals__.collisionCount);
    });

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文字
    this.add.text(10, 330, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#000000',
      backgroundColor: '#FFFFFF',
      padding: { x: 5, y: 5 }
    });

    // 添加位置显示
    this.positionText = this.add.text(10, 360, '', {
      fontSize: '14px',
      fill: '#000000',
      backgroundColor: '#FFFFFF',
      padding: { x: 5, y: 5 }
    });

    // 初始化信号
    this.updateSignals();
  }

  update() {
    const speed = 150;

    // 重置速度
    this.player.setVelocity(0);

    // 检查周围 tile 是否可通行
    const playerTileX = Math.floor(this.player.x / 64);
    const playerTileY = Math.floor(this.player.y / 64);

    // 方向键控制
    if (this.cursors.left.isDown) {
      const leftTile = this.map.getTileAt(playerTileX - 1, playerTileY);
      if (!leftTile || leftTile.index !== 1) {
        this.player.setVelocityX(-speed);
        window.__signals__.canMoveLeft = true;
      } else {
        window.__signals__.canMoveLeft = false;
      }
    } else if (this.cursors.right.isDown) {
      const rightTile = this.map.getTileAt(playerTileX + 1, playerTileY);
      if (!rightTile || rightTile.index !== 1) {
        this.player.setVelocityX(speed);
        window.__signals__.canMoveRight = true;
      } else {
        window.__signals__.canMoveRight = false;
      }
    }

    if (this.cursors.up.isDown) {
      const upTile = this.map.getTileAt(playerTileX, playerTileY - 1);
      if (!upTile || upTile.index !== 1) {
        this.player.setVelocityY(-speed);
        window.__signals__.canMoveUp = true;
      } else {
        window.__signals__.canMoveUp = false;
      }
    } else if (this.cursors.down.isDown) {
      const downTile = this.map.getTileAt(playerTileX, playerTileY + 1);
      if (!downTile || downTile.index !== 1) {
        this.player.setVelocityY(speed);
        window.__signals__.canMoveDown = true;
      } else {
        window.__signals__.canMoveDown = false;
      }
    }

    // 更新信号
    this.updateSignals();

    // 更新位置显示
    this.positionText.setText(
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)}) | ` +
      `Tile: (${playerTileX}, ${playerTileY})`
    );

    // 输出 JSON 日志（每 60 帧输出一次）
    if (this.game.loop.frame % 60 === 0) {
      console.log(JSON.stringify(window.__signals__));
    }
  }

  updateSignals() {
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.tileX = Math.floor(this.player.x / 64);
    window.__signals__.tileY = Math.floor(this.player.y / 64);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 320,
  height: 400,
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