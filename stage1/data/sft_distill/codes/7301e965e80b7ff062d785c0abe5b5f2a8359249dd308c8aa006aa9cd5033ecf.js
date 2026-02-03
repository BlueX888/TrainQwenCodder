class SplitScreenScene extends Phaser.Scene {
  constructor() {
    super('SplitScreenScene');
    this.player1CollisionCount = 0;
    this.player2CollisionCount = 0;
    this.totalCollisions = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建玩家1纹理（蓝色方块）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x0088ff, 1);
    graphics1.fillRect(0, 0, 32, 32);
    graphics1.generateTexture('player1', 32, 32);
    graphics1.destroy();

    // 创建玩家2纹理（红色方块）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0088, 1);
    graphics2.fillRect(0, 0, 32, 32);
    graphics2.generateTexture('player2', 32, 32);
    graphics2.destroy();

    // 创建背景网格以便观察移动
    this.createGrid(width, height);

    // 创建玩家1（左侧出生）
    this.player1 = this.physics.add.sprite(width * 0.25, height / 2, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.3);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);
    this.player1.body.setMaxVelocity(240, 240);

    // 创建玩家2（右侧出生）
    this.player2 = this.physics.add.sprite(width * 0.75, height / 2, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.3);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);
    this.player2.body.setMaxVelocity(240, 240);

    // 设置玩家之间的碰撞
    this.physics.add.collider(this.player1, this.player2, this.handleCollision, null, this);

    // 配置键盘输入
    // 玩家1使用 WASD
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2使用方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 设置分屏摄像机
    this.setupSplitScreen(width, height);

    // 创建UI文本显示状态
    this.createUI();
  }

  createGrid(width, height) {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 绘制中线
    graphics.lineStyle(2, 0xffffff, 0.8);
    graphics.lineBetween(width / 2, 0, width / 2, height);
  }

  setupSplitScreen(width, height) {
    // 主摄像机设置为左半屏，跟随玩家1
    this.cameras.main.setViewport(0, 0, width / 2, height);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, width, height);

    // 添加第二个摄像机用于右半屏，跟随玩家2
    this.camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    this.camera2.startFollow(this.player2, true, 0.1, 0.1);
    this.camera2.setZoom(1);
    this.camera2.setBounds(0, 0, width, height);
  }

  createUI() {
    const { width, height } = this.cameras.main;

    // 玩家1信息（固定在左侧摄像机）
    this.text1 = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#0088ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text1.setScrollFactor(0);
    this.text1.setDepth(100);

    // 玩家2信息（固定在右侧摄像机）
    this.text2 = this.add.text(width / 2 + 10, 10, '', {
      fontSize: '14px',
      fill: '#ff0088',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.text2.setScrollFactor(0);
    this.text2.setDepth(100);

    // 总碰撞次数（显示在两个屏幕上）
    this.collisionText = this.add.text(width / 4, height - 30, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 8, y: 5 }
    });
    this.collisionText.setOrigin(0.5);
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(100);
  }

  handleCollision(player1, player2) {
    // 碰撞时施加弹开力
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );

    const bounceForce = 300;
    
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

    // 更新碰撞计数
    this.player1CollisionCount++;
    this.player2CollisionCount++;
    this.totalCollisions++;
  }

  update(time, delta) {
    // 玩家1移动控制（WASD）
    const speed = 240;
    
    if (this.keys1.left.isDown) {
      this.player1.setVelocityX(-speed);
    } else if (this.keys1.right.isDown) {
      this.player1.setVelocityX(speed);
    } else {
      this.player1.setVelocityX(this.player1.body.velocity.x * 0.9);
    }

    if (this.keys1.up.isDown) {
      this.player1.setVelocityY(-speed);
    } else if (this.keys1.down.isDown) {
      this.player1.setVelocityY(speed);
    } else {
      this.player1.setVelocityY(this.player1.body.velocity.y * 0.9);
    }

    // 玩家2移动控制（方向键）
    if (this.keys2.left.isDown) {
      this.player2.setVelocityX(-speed);
    } else if (this.keys2.right.isDown) {
      this.player2.setVelocityX(speed);
    } else {
      this.player2.setVelocityX(this.player2.body.velocity.x * 0.9);
    }

    if (this.keys2.up.isDown) {
      this.player2.setVelocityY(-speed);
    } else if (this.keys2.down.isDown) {
      this.player2.setVelocityY(speed);
    } else {
      this.player2.setVelocityY(this.player2.body.velocity.y * 0.9);
    }

    // 更新UI文本
    this.text1.setText([
      'Player 1 (WASD)',
      `Pos: (${Math.round(this.player1.x)}, ${Math.round(this.player1.y)})`,
      `Vel: (${Math.round(this.player1.body.velocity.x)}, ${Math.round(this.player1.body.velocity.y)})`,
      `Collisions: ${this.player1CollisionCount}`
    ]);

    this.text2.setText([
      'Player 2 (Arrows)',
      `Pos: (${Math.round(this.player2.x)}, ${Math.round(this.player2.y)})`,
      `Vel: (${Math.round(this.player2.body.velocity.x)}, ${Math.round(this.player2.body.velocity.y)})`,
      `Collisions: ${this.player2CollisionCount}`
    ]);

    this.collisionText.setText(`Total Collisions: ${this.totalCollisions}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 600,
  backgroundColor: '#111111',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: SplitScreenScene
};

// 创建游戏实例
new Phaser.Game(config);