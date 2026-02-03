class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 初始重力方向
    this.gravityMagnitude = 1000;
  }

  preload() {
    // 使用 Graphics 创建玩家纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（启用物理）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建地面和边界（用于碰撞）
    this.createBoundaries();

    // 设置初始重力（向下）
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = this.gravityMagnitude;

    // 创建重力方向显示文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setScrollFactor(0);

    // 创建操作说明文本
    this.add.text(16, 60, 'Press WASD to change gravity direction', {
      fontSize: '16px',
      color: '#cccccc',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setScrollFactor(0);

    // 绑定 WASD 键
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键事件（使用 on 'down' 避免重复触发）
    this.keyW.on('down', () => this.setGravity('UP'));
    this.keyA.on('down', () => this.setGravity('LEFT'));
    this.keyS.on('down', () => this.setGravity('DOWN'));
    this.keyD.on('down', () => this.setGravity('RIGHT'));

    // 初始化可验证信号
    window.__signals__ = {
      gravityDirection: this.gravityDirection,
      gravityX: this.physics.world.gravity.x,
      gravityY: this.physics.world.gravity.y,
      playerX: this.player.x,
      playerY: this.player.y,
      frameCount: 0
    };
  }

  createBoundaries() {
    // 创建四周的静态边界平台
    const platforms = this.physics.add.staticGroup();

    // 底部
    const bottomGraphics = this.add.graphics();
    bottomGraphics.fillStyle(0x666666, 1);
    bottomGraphics.fillRect(0, 0, 800, 50);
    bottomGraphics.generateTexture('bottomPlatform', 800, 50);
    bottomGraphics.destroy();
    platforms.create(400, 575, 'bottomPlatform');

    // 顶部
    const topGraphics = this.add.graphics();
    topGraphics.fillStyle(0x666666, 1);
    topGraphics.fillRect(0, 0, 800, 50);
    topGraphics.generateTexture('topPlatform', 800, 50);
    topGraphics.destroy();
    platforms.create(400, 25, 'topPlatform');

    // 左侧
    const leftGraphics = this.add.graphics();
    leftGraphics.fillStyle(0x666666, 1);
    leftGraphics.fillRect(0, 0, 50, 600);
    leftGraphics.generateTexture('leftPlatform', 50, 600);
    leftGraphics.destroy();
    platforms.create(25, 300, 'leftPlatform');

    // 右侧
    const rightGraphics = this.add.graphics();
    rightGraphics.fillStyle(0x666666, 1);
    rightGraphics.fillRect(0, 0, 50, 600);
    rightGraphics.generateTexture('rightPlatform', 50, 600);
    rightGraphics.destroy();
    platforms.create(775, 300, 'rightPlatform');

    // 玩家与平台碰撞
    this.physics.add.collider(this.player, platforms);
  }

  setGravity(direction) {
    this.gravityDirection = direction;

    // 重置重力
    this.physics.world.gravity.x = 0;
    this.physics.world.gravity.y = 0;

    // 根据方向设置重力
    switch (direction) {
      case 'UP':
        this.physics.world.gravity.y = -this.gravityMagnitude;
        break;
      case 'DOWN':
        this.physics.world.gravity.y = this.gravityMagnitude;
        break;
      case 'LEFT':
        this.physics.world.gravity.x = -this.gravityMagnitude;
        break;
      case 'RIGHT':
        this.physics.world.gravity.x = this.gravityMagnitude;
        break;
    }

    // 更新显示文本
    this.gravityText.setText(`Gravity: ${direction}`);

    // 更新可验证信号
    window.__signals__.gravityDirection = direction;
    window.__signals__.gravityX = this.physics.world.gravity.x;
    window.__signals__.gravityY = this.physics.world.gravity.y;

    // 输出日志（JSON格式，便于验证）
    console.log(JSON.stringify({
      event: 'gravityChanged',
      direction: direction,
      gravityX: this.physics.world.gravity.x,
      gravityY: this.physics.world.gravity.y,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 更新可验证信号（每帧）
    window.__signals__.playerX = Math.round(this.player.x * 100) / 100;
    window.__signals__.playerY = Math.round(this.player.y * 100) / 100;
    window.__signals__.frameCount++;

    // 每60帧输出一次位置日志（约1秒）
    if (window.__signals__.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        event: 'playerPosition',
        x: window.__signals__.playerX,
        y: window.__signals__.playerY,
        velocityX: Math.round(this.player.body.velocity.x * 100) / 100,
        velocityY: Math.round(this.player.body.velocity.y * 100) / 100,
        frame: window.__signals__.frameCount
      }));
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 启动游戏
new Phaser.Game(config);