class SplitScreenGame extends Phaser.Scene {
  constructor() {
    super('SplitScreenGame');
    this.player1Score = 0;
    this.player2Score = 0;
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    this.createPlayerTextures();

    // 创建玩家1 (左侧，蓝色)
    this.player1 = this.physics.add.sprite(200, 300, 'player1Tex');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.3);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);
    this.player1.setMaxVelocity(80);

    // 创建玩家2 (右侧，红色)
    this.player2 = this.physics.add.sprite(600, 300, 'player2Tex');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.3);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);
    this.player2.setMaxVelocity(80);

    // 设置玩家碰撞
    this.physics.add.collider(this.player1, this.player2, this.handleCollision, null, this);

    // 设置分屏摄像机
    this.setupCameras();

    // 设置输入控制
    this.setupInput();

    // 创建背景网格便于观察
    this.createBackground();

    // 创建分数显示
    this.createScoreDisplay();
  }

  createPlayerTextures() {
    // 玩家1纹理 (蓝色)
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillCircle(20, 20, 20);
    graphics1.fillStyle(0xffffff, 1);
    graphics1.fillCircle(15, 15, 5); // 眼睛
    graphics1.generateTexture('player1Tex', 40, 40);
    graphics1.destroy();

    // 玩家2纹理 (红色)
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0044, 1);
    graphics2.fillCircle(20, 20, 20);
    graphics2.fillStyle(0xffffff, 1);
    graphics2.fillCircle(25, 15, 5); // 眼睛
    graphics2.generateTexture('player2Tex', 40, 40);
    graphics2.destroy();
  }

  setupCameras() {
    // 主摄像机设置为玩家1的视角 (左半屏)
    this.cameras.main.setViewport(0, 0, 400, 600);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setBackgroundColor(0x1a1a2e);

    // 创建玩家2的摄像机 (右半屏)
    this.camera2 = this.cameras.add(400, 0, 400, 600);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    this.camera2.setBackgroundColor(0x2e1a1a);
  }

  setupInput() {
    // 玩家1控制 (WASD)
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2控制 (方向键)
    this.keys2 = this.input.keyboard.createCursorKeys();
  }

  createBackground() {
    // 创建网格背景
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 添加中心标记
    graphics.fillStyle(0xffff00, 0.3);
    graphics.fillCircle(400, 300, 10);
  }

  createScoreDisplay() {
    // 玩家1分数 (固定在左上角)
    this.score1Text = this.add.text(10, 10, 'P1: 0', {
      fontSize: '20px',
      fill: '#0088ff',
      fontStyle: 'bold'
    });
    this.score1Text.setScrollFactor(0);

    // 玩家2分数 (固定在右上角)
    this.score2Text = this.add.text(410, 10, 'P2: 0', {
      fontSize: '20px',
      fill: '#ff0044',
      fontStyle: 'bold'
    });
    this.score2Text.setScrollFactor(0);

    // 碰撞计数
    this.collisionText = this.add.text(10, 40, 'Collisions: 0', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    this.collisionText.setScrollFactor(0);
  }

  handleCollision(player1, player2) {
    // 碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 计算碰撞方向
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );

    // 弹开力度
    const bounceForce = 150;

    // 玩家1向反方向弹开
    player1.setVelocity(
      Math.cos(angle + Math.PI) * bounceForce,
      Math.sin(angle + Math.PI) * bounceForce
    );

    // 玩家2向正方向弹开
    player2.setVelocity(
      Math.cos(angle) * bounceForce,
      Math.sin(angle) * bounceForce
    );

    // 增加分数
    this.player1Score++;
    this.player2Score++;
    this.score1Text.setText(`P1: ${this.player1Score}`);
    this.score2Text.setText(`P2: ${this.player2Score}`);
  }

  update(time, delta) {
    // 玩家1移动 (WASD)
    const speed = 80;
    
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed);
    }

    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed);
    }

    // 玩家2移动 (方向键)
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed);
    }

    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed);
    }
  }
}

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
  scene: SplitScreenGame
};

new Phaser.Game(config);