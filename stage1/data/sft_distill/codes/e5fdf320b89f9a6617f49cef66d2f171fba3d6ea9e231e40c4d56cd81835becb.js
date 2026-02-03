class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerReachedEnd = false;
    this.platformsPassed = 0;
    this.jumpCount = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xff6600, 1);
    platformGraphics.fillRect(0, 0, 150, 20);
    platformGraphics.generateTexture('platform', 150, 20);
    platformGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();

    // 创建终点纹理
    const goalGraphics = this.add.graphics();
    goalGraphics.fillStyle(0xffff00, 1);
    goalGraphics.fillRect(0, 0, 40, 80);
    goalGraphics.generateTexture('goal', 40, 80);
    goalGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(800);

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 580, 'ground');

    // 创建移动平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 平台1：水平移动（左右）
    this.platform1 = this.platforms.create(250, 450, 'platform');
    this.platform1.body.setVelocityX(120);
    this.platform1.minX = 150;
    this.platform1.maxX = 350;
    this.platform1.checkpoints = { passed: false };

    // 平台2：水平移动（左右），位置更高更远
    this.platform2 = this.platforms.create(450, 350, 'platform');
    this.platform2.body.setVelocityX(-120);
    this.platform2.minX = 350;
    this.platform2.maxX = 550;
    this.platform2.checkpoints = { passed: false };

    // 平台3：水平移动（左右），最高位置
    this.platform3 = this.platforms.create(650, 250, 'platform');
    this.platform3.body.setVelocityX(120);
    this.platform3.minX = 550;
    this.platform3.maxX = 700;
    this.platform3.checkpoints = { passed: false };

    // 创建终点
    this.goal = this.physics.add.staticSprite(750, 510, 'goal');

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, null, this);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 添加说明文本
    this.add.text(16, 50, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
  }

  update(time, delta) {
    // 更新平台移动（反向运动）
    this.updatePlatformMovement(this.platform1);
    this.updatePlatformMovement(this.platform2);
    this.updatePlatformMovement(this.platform3);

    // 玩家控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.player.body.touching.down || this.player.body.blocked.down) {
        this.player.setVelocityY(-500);
        this.jumpCount++;
        this.updateStatusText();
      }
    }

    // 检查平台通过状态
    this.checkPlatformProgress();

    // 更新状态文本
    this.updateStatusText();
  }

  updatePlatformMovement(platform) {
    // 检查边界并反向
    if (platform.x <= platform.minX) {
      platform.x = platform.minX;
      platform.body.setVelocityX(120);
    } else if (platform.x >= platform.maxX) {
      platform.x = platform.maxX;
      platform.body.setVelocityX(-120);
    }
  }

  checkPlatformProgress() {
    // 检查玩家是否通过了每个平台
    if (!this.platform1.checkpoints.passed && this.player.x > this.platform1.maxX) {
      this.platform1.checkpoints.passed = true;
      this.platformsPassed = Math.max(this.platformsPassed, 1);
    }

    if (!this.platform2.checkpoints.passed && this.player.x > this.platform2.maxX) {
      this.platform2.checkpoints.passed = true;
      this.platformsPassed = Math.max(this.platformsPassed, 2);
    }

    if (!this.platform3.checkpoints.passed && this.player.x > this.platform3.maxX) {
      this.platform3.checkpoints.passed = true;
      this.platformsPassed = Math.max(this.platformsPassed, 3);
    }
  }

  reachGoal(player, goal) {
    if (!this.playerReachedEnd) {
      this.playerReachedEnd = true;
      this.player.setVelocity(0, 0);
      this.updateStatusText();
      
      // 显示成功消息
      const successText = this.add.text(400, 300, 'SUCCESS!\nYou reached the goal!', {
        fontSize: '32px',
        fill: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      });
      successText.setOrigin(0.5);
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Platforms Passed: ${this.platformsPassed}/3 | ` +
      `Jumps: ${this.jumpCount} | ` +
      `Goal Reached: ${this.playerReachedEnd ? 'YES' : 'NO'}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
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