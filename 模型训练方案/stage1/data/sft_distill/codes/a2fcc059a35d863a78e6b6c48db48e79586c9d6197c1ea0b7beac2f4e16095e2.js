class SplitScreenGame extends Phaser.Scene {
  constructor() {
    super('SplitScreenGame');
    // 状态信号变量
    this.player1Score = 0;
    this.player2Score = 0;
    this.collisionCount = 0;
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

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

    // 创建背景区分（左侧浅蓝，右侧浅红）
    const bgLeft = this.add.rectangle(width / 4, height / 2, width / 2, height, 0x001133, 0.3);
    const bgRight = this.add.rectangle(width * 3 / 4, height / 2, width / 2, height, 0x330011, 0.3);

    // 创建中线
    const centerLine = this.add.graphics();
    centerLine.lineStyle(2, 0xffffff, 0.5);
    centerLine.lineBetween(width / 2, 0, width / 2, height);

    // 创建玩家1（左侧）
    this.player1 = this.physics.add.sprite(width / 4, height / 2, 'player1');
    this.player1.setCollideWorldBounds(true);
    this.player1.setBounce(0.3);
    this.player1.setDamping(true);
    this.player1.setDrag(0.95);
    this.player1.body.setMaxVelocity(80, 80);

    // 创建玩家2（右侧）
    this.player2 = this.physics.add.sprite(width * 3 / 4, height / 2, 'player2');
    this.player2.setCollideWorldBounds(true);
    this.player2.setBounce(0.3);
    this.player2.setDamping(true);
    this.player2.setDrag(0.95);
    this.player2.body.setMaxVelocity(80, 80);

    // 添加碰撞检测
    this.physics.add.collider(this.player1, this.player2, this.handleCollision, null, this);

    // 创建键盘输入
    // 玩家1: WASD
    this.keys1 = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 玩家2: 方向键
    this.keys2 = this.input.keyboard.createCursorKeys();

    // 设置摄像机
    // 主摄像机（玩家1视角）- 左半屏
    this.cameras.main.setViewport(0, 0, width / 2, height);
    this.cameras.main.startFollow(this.player1, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, width, height);

    // 添加第二个摄像机（玩家2视角）- 右半屏
    const camera2 = this.cameras.add(width / 2, 0, width / 2, height);
    camera2.startFollow(this.player2, true, 0.1, 0.1);
    camera2.setZoom(1);
    camera2.setBounds(0, 0, width, height);

    // 添加UI文本显示状态
    this.statusText1 = this.add.text(10, 10, '', {
      fontSize: '14px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.statusText1.setScrollFactor(0);
    this.statusText1.setDepth(1000);

    this.statusText2 = this.add.text(width / 2 + 10, 10, '', {
      fontSize: '14px',
      fill: '#ff00ff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    this.statusText2.setScrollFactor(0);
    this.statusText2.setDepth(1000);

    // 让第二个摄像机也能看到对应的状态文本
    camera2.ignore([this.statusText1]);
    this.cameras.main.ignore([this.statusText2]);

    // 添加说明文本
    const instructions = this.add.text(width / 2, height - 30, 
      'Player 1 (Blue): WASD | Player 2 (Red): Arrow Keys', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    instructions.setOrigin(0.5);
    instructions.setScrollFactor(0);
    instructions.setDepth(1000);
  }

  handleCollision(player1, player2) {
    // 碰撞计数
    this.collisionCount++;

    // 计算碰撞方向
    const angle = Phaser.Math.Angle.Between(
      player1.x, player1.y,
      player2.x, player2.y
    );

    // 施加反向推力实现弹开效果
    const pushForce = 150;
    player1.setVelocity(
      -Math.cos(angle) * pushForce,
      -Math.sin(angle) * pushForce
    );
    player2.setVelocity(
      Math.cos(angle) * pushForce,
      Math.sin(angle) * pushForce
    );

    // 更新分数
    this.player1Score++;
    this.player2Score++;
  }

  update(time, delta) {
    // 玩家1控制 (WASD)
    const speed = 80;
    
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

    // 玩家2控制 (方向键)
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

    // 更新状态显示
    this.statusText1.setText([
      'Player 1 (Blue)',
      `Pos: (${Math.round(this.player1.x)}, ${Math.round(this.player1.y)})`,
      `Collisions: ${this.collisionCount}`,
      `Score: ${this.player1Score}`
    ]);

    this.statusText2.setText([
      'Player 2 (Red)',
      `Pos: (${Math.round(this.player2.x)}, ${Math.round(this.player2.y)})`,
      `Collisions: ${this.collisionCount}`,
      `Score: ${this.player2Score}`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 1200,
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

// 启动游戏
new Phaser.Game(config);