class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.player1 = null;
    this.player2 = null;
    this.cursors1 = null;
    this.cursors2 = null;
    this.signals = {
      player1: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      player2: { x: 0, y: 0, velocity: { x: 0, y: 0 } },
      collisionCount: 0,
      timestamp: 0
    };
  }

  preload() {
    // 无需外部资源
  }

  create() {
    const worldWidth = 1600;
    const worldHeight = 600;
    
    // 设置世界边界
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0000ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.generateTexture('player1Tex', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0000, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.generateTexture('player2Tex', 32, 32);
    graphics2.destroy();

    // 创建背景网格以便观察移动
    this.createGrid(worldWidth, worldHeight);

    // 创建玩家1（左侧起始位置）
    this.player1 = this.physics.add.sprite(400, 300, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);

    // 创建玩家2（右侧起始位置）
    this.player2 = this.physics.add.sprite(1200, 300, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);

    // 设置玩家碰撞
    this.physics.add.collider(this.player1, this.player2, this.onPlayerCollision, null, this);

    // 设置键盘控制
    // 玩家1：WASD
    this.cursors1 = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 玩家2：方向键
    this.cursors2 = this.input.keyboard.createCursorKeys();

    // 创建分屏摄像机
    this.setupCameras();

    // 添加文本提示
    this.addInstructions();

    // 暴露信号到全局
    window.__signals__ = this.signals;

    // 初始化信号
    this.updateSignals();
  }

  createGrid(width, height) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 垂直线
    for (let x = 0; x <= width; x += 100) {
      graphics.lineBetween(x, 0, x, height);
    }
    
    // 水平线
    for (let y = 0; y <= height; y += 100) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  setupCameras() {
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    // 主摄像机设置为玩家1视角（左半屏）
    const cam1 = this.cameras.main;
    cam1.setViewport(0, 0, gameWidth / 2, gameHeight);
    cam1.setBounds(0, 0, 1600, 600);
    cam1.startFollow(this.player1, true, 0.1, 0.1);
    cam1.setZoom(1);

    // 添加玩家2摄像机（右半屏）
    const cam2 = this.cameras.add(gameWidth / 2, 0, gameWidth / 2, gameHeight);
    cam2.setBounds(0, 0, 1600, 600);
    cam2.startFollow(this.player2, true, 0.1, 0.1);
    cam2.setZoom(1);

    // 添加分隔线
    const divider = this.add.graphics();
    divider.fillStyle(0xffffff, 1);
    divider.fillRect(gameWidth / 2 - 2, 0, 4, gameHeight);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  addInstructions() {
    const style = { 
      fontSize: '16px', 
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };

    // 玩家1提示
    const text1 = this.add.text(10, 10, 'Player 1 (Blue)\nWASD to move', style);
    text1.setScrollFactor(0);
    text1.setDepth(999);

    // 玩家2提示
    const text2 = this.add.text(10, 10, 'Player 2 (Red)\nArrows to move', style);
    text2.setScrollFactor(0);
    text2.setDepth(999);
    
    // 让文本2只在第二个摄像机中显示
    this.cameras.main.ignore(text2);
    this.cameras.cameras[1].ignore(text1);

    // 碰撞计数显示
    this.collisionText = this.add.text(10, 80, 'Collisions: 0', {
      fontSize: '14px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(999);
  }

  onPlayerCollision(player1, player2) {
    // 碰撞时增加弹开效果
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );
    
    const force = 300;
    player1.setVelocity(
      -Math.cos(angle) * force,
      -Math.sin(angle) * force
    );
    player2.setVelocity(
      Math.cos(angle) * force,
      Math.sin(angle) * force
    );

    this.signals.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.signals.collisionCount}`);
    
    console.log('Collision detected:', {
      count: this.signals.collisionCount,
      player1Pos: { x: player1.x, y: player1.y },
      player2Pos: { x: player2.x, y: player2.y }
    });
  }

  update(time, delta) {
    // 玩家1控制 (WASD)
    const speed = 200;
    
    if (this.cursors1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.cursors1.right.isDown) {
      this.player1.setVelocityX(speed);
    }

    if (this.cursors1.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.cursors1.down.isDown) {
      this.player1.setVelocityY(speed);
    }

    // 玩家2控制 (方向键)
    if (this.cursors2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.cursors2.right.isDown) {
      this.player2.setVelocityX(speed);
    }

    if (this.cursors2.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.cursors2.down.isDown) {
      this.player2.setVelocityY(speed);
    }

    // 更新信号
    this.updateSignals(time);
  }

  updateSignals(time = 0) {
    this.signals.player1.x = Math.round(this.player1.x);
    this.signals.player1.y = Math.round(this.player1.y);
    this.signals.player1.velocity.x = Math.round(this.player1.body.velocity.x);
    this.signals.player1.velocity.y = Math.round(this.player1.body.velocity.y);

    this.signals.player2.x = Math.round(this.player2.x);
    this.signals.player2.y = Math.round(this.player2.y);
    this.signals.player2.velocity.x = Math.round(this.player2.body.velocity.x);
    this.signals.player2.velocity.y = Math.round(this.player2.body.velocity.y);

    this.signals.timestamp = time;
  }
}

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
  scene: SplitScreenScene
};

const game = new Phaser.Game(config);

// 输出验证信息
console.log('Split-screen multiplayer game initialized');
console.log('Player 1: WASD controls (Blue, left screen)');
console.log('Player 2: Arrow keys controls (Red, right screen)');
console.log('Access signals via: window.__signals__');