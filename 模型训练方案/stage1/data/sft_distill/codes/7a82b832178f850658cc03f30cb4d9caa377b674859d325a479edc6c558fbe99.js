class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.platformSpeed = 120;
    this.platformDirection = 1; // 1: 向右, -1: 向左
    this.playerOnPlatform = false;
    this.score = 0; // 状态信号：得分
    this.platformReversals = 0; // 状态信号：平台反转次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色移动平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0xFF8800, 1); // 橙色
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platformTex', 200, 30);
    platformGraphics.destroy();

    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FF00, 1); // 绿色
    playerGraphics.fillRect(0, 0, 40, 50);
    playerGraphics.generateTexture('playerTex', 40, 50);
    playerGraphics.destroy();

    // 创建地面（用于参考和边界）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1); // 棕色
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('groundTex', 800, 50);
    groundGraphics.destroy();

    // 创建地面精灵
    this.ground = this.physics.add.sprite(400, 575, 'groundTex');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建移动平台
    this.platform = this.physics.add.sprite(200, 400, 'platformTex');
    this.platform.setImmovable(true);
    this.platform.body.allowGravity = false;
    this.platform.setVelocityX(this.platformSpeed * this.platformDirection);

    // 设置平台移动边界（左边界50，右边界750）
    this.platformMinX = 50;
    this.platformMaxX = 750;

    // 创建玩家
    this.player = this.physics.add.sprite(200, 300, 'playerTex');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.platformCollider = this.physics.add.collider(
      this.player, 
      this.platform,
      null,
      null,
      this
    );

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文字
    this.add.text(10, 50, '使用方向键移动，空格跳跃', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 检测平台是否到达边界，如果是则反转方向
    if (this.platform.x <= this.platformMinX && this.platformDirection === -1) {
      this.platformDirection = 1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformReversals++;
      this.updateStatusText();
    } else if (this.platform.x >= this.platformMaxX && this.platformDirection === 1) {
      this.platformDirection = -1;
      this.platform.setVelocityX(this.platformSpeed * this.platformDirection);
      this.platformReversals++;
      this.updateStatusText();
    }

    // 检测玩家是否在平台上
    this.playerOnPlatform = this.physics.world.overlap(this.player, this.platform) && 
                            this.player.body.touching.down;

    // 玩家水平移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      // 如果玩家在平台上，继承平台的水平速度
      if (this.playerOnPlatform) {
        this.player.setVelocityX(this.platform.body.velocity.x);
      } else {
        this.player.setVelocityX(0);
      }
    }

    // 跳跃控制
    if (this.cursors.space.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.score += 10; // 每次跳跃增加分数
      this.updateStatusText();
    }

    // 更新状态文本
    if (Math.floor(time / 100) % 10 === 0) {
      this.updateStatusText();
    }
  }

  updateStatusText() {
    const onPlatformText = this.playerOnPlatform ? '是' : '否';
    const directionText = this.platformDirection === 1 ? '向右' : '向左';
    
    this.statusText.setText([
      `得分: ${this.score}`,
      `平台反转次数: ${this.platformReversals}`,
      `平台方向: ${directionText}`,
      `玩家在平台上: ${onPlatformText}`,
      `平台位置: ${Math.floor(this.platform.x)}`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天蓝色背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);