class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.player1 = null;
    this.player2 = null;
    this.keys1 = null;
    this.keys2 = null;
    this.collisionCount = 0;
  }

  preload() {
    // 使用 Graphics 生成玩家纹理
    this.createPlayerTextures();
  }

  createPlayerTextures() {
    // 玩家1纹理 - 蓝色方块
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.lineStyle(2, 0x0044aa, 1);
    graphics1.strokeRect(0, 0, 32, 32);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 玩家2纹理 - 红色方块
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0044, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.lineStyle(2, 0xaa0022, 1);
    graphics2.strokeRect(0, 0, 32, 32);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();

    // 创建背景网格纹理
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a1a, 1);
    bgGraphics.fillRect(0, 0, 800, 600);
    bgGraphics.lineStyle(1, 0x333333, 0.5);
    for (let x = 0; x < 800; x += 50) {
      bgGraphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      bgGraphics.lineBetween(0, y, 800, y);
    }
    bgGraphics.generateTexture('background', 800, 600);
    bgGraphics.destroy();
  }

  create() {
    // 添加背景
    this.add.image(400, 300, 'background');

    // 创建玩家1（左侧，蓝色）
    this.player1 = this.physics.add.sprite(200, 300, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.5); // 设置弹性
    this.player1.setDamping(true);
    this.player1.setDrag(0.8);
    this.player1.body.setMass(1);

    // 创建玩家2（右侧，红色）
    this.player2 = this.physics.add.sprite(600, 300, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.5); // 设置弹性
    this.player2.setDamping(true);
    this.player2.setDrag(0.8);
    this.player2.body.setMass(1);

    // 设置玩家之间的碰撞，启用弹性效果
    this.physics.add.collider(this.player1, this.player2, () => {
      this.collisionCount++;
      this.updateSignals();
    });

    // 创建分屏摄像机
    this.setupCameras();

    // 设置键盘控制
    this.setupControls();

    // 添加UI文本
    this.createUI();

    // 初始化信号
    this.initializeSignals();
  }

  setupCameras() {
    // 获取默认摄像机（玩家1使用）
    const cam1 = this.cameras.main;
    cam1.setViewport(0, 0, 400, 600); // 左半屏
    cam1.setBounds(0, 0, 800, 600);
    cam1.startFollow(this.player1, true, 0.1, 0.1);
    cam1.setBackgroundColor(0x000033);

    // 创建第二个摄像机（玩家2使用）
    const cam2 = this.cameras.add(400, 0, 400, 600);
    cam2.setBounds(0, 0, 800, 600);
    cam2.startFollow(this.player2, true, 0.1, 0.1);
    cam2.setBackgroundColor(0x330000);

    // 添加分割线
    const divider = this.add.graphics();
    divider.fillStyle(0xffffff, 1);
    divider.fillRect(398, 0, 4, 600);
    divider.setScrollFactor(0);
    divider.setDepth(1000);
  }

  setupControls() {
    // 玩家1控制 - WASD
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2控制 - 方向键
    this.keys2 = this.input.keyboard.createCursorKeys();
  }

  createUI() {
    // 玩家1标签（固定在左侧摄像机）
    const label1 = this.add.text(10, 10, 'Player 1 (WASD)', {
      fontSize: '16px',
      color: '#00aaff',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    label1.setScrollFactor(0);
    label1.setDepth(1001);

    // 玩家2标签（固定在右侧摄像机）
    const label2 = this.add.text(410, 10, 'Player 2 (Arrows)', {
      fontSize: '16px',
      color: '#ff0044',
      fontFamily: 'Arial',
      fontStyle: 'bold'
    });
    label2.setScrollFactor(0);
    label2.setDepth(1001);

    // 碰撞计数器
    this.collisionText = this.add.text(10, 570, 'Collisions: 0', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(1001);
  }

  initializeSignals() {
    window.__signals__ = {
      player1: {
        x: this.player1.x,
        y: this.player1.y,
        velocityX: 0,
        velocityY: 0
      },
      player2: {
        x: this.player2.x,
        y: this.player2.y,
        velocityX: 0,
        velocityY: 0
      },
      collisionCount: 0,
      distance: 0,
      gameTime: 0
    };
  }

  updateSignals() {
    const distance = Phaser.Math.Distance.Between(
      this.player1.x, this.player1.y,
      this.player2.x, this.player2.y
    );

    window.__signals__ = {
      player1: {
        x: Math.round(this.player1.x * 100) / 100,
        y: Math.round(this.player1.y * 100) / 100,
        velocityX: Math.round(this.player1.body.velocity.x * 100) / 100,
        velocityY: Math.round(this.player1.body.velocity.y * 100) / 100
      },
      player2: {
        x: Math.round(this.player2.x * 100) / 100,
        y: Math.round(this.player2.y * 100) / 100,
        velocityX: Math.round(this.player2.body.velocity.x * 100) / 100,
        velocityY: Math.round(this.player2.body.velocity.y * 100) / 100
      },
      collisionCount: this.collisionCount,
      distance: Math.round(distance * 100) / 100,
      gameTime: Math.round(this.time.now / 1000 * 100) / 100
    };

    // 更新UI
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);
  }

  update(time, delta) {
    const speed = 160;

    // 玩家1移动（WASD）
    let velocity1X = 0;
    let velocity1Y = 0;

    if (this.keys1.left.isDown) {
      velocity1X = -speed;
    } else if (this.keys1.right.isDown) {
      velocity1X = speed;
    }

    if (this.keys1.up.isDown) {
      velocity1Y = -speed;
    } else if (this.keys1.down.isDown) {
      velocity1Y = speed;
    }

    this.player1.setVelocity(velocity1X, velocity1Y);

    // 玩家2移动（方向键）
    let velocity2X = 0;
    let velocity2Y = 0;

    if (this.keys2.left.isDown) {
      velocity2X = -speed;
    } else if (this.keys2.right.isDown) {
      velocity2X = speed;
    }

    if (this.keys2.up.isDown) {
      velocity2Y = -speed;
    } else if (this.keys2.down.isDown) {
      velocity2Y = speed;
    }

    this.player2.setVelocity(velocity2X, velocity2Y);

    // 更新信号（每帧）
    this.updateSignals();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: SplitScreenScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态日志
console.log('[GAME_START]', JSON.stringify({
  timestamp: Date.now(),
  config: {
    width: config.width,
    height: config.height,
    playerSpeed: 160,
    splitScreen: true
  }
}));