class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.totalJumps = 0; // 总跳跃次数（可验证状态）
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

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面平台
    this.ground = this.physics.add.staticGroup();
    const groundSprite = this.ground.create(400, 575, 'ground');
    groundSprite.setScale(1).refreshBody();

    // 设置玩家与地面的碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 玩家着地时重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
      }
    });

    // 添加键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示跳跃信息
    this.jumpText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明
    this.add.text(16, 50, '按空格键跳跃（可双跳）', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateJumpText();
  }

  update() {
    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleJump();
    }

    // 更新跳跃信息显示
    this.updateJumpText();
  }

  handleJump() {
    // 检查是否可以跳跃
    if (this.jumpCount < this.maxJumps) {
      // 执行跳跃
      this.player.setVelocityY(-320); // 跳跃力度120对应速度约-320
      this.jumpCount++;
      this.totalJumps++;
      
      // 视觉反馈：改变颜色
      if (this.jumpCount === 1) {
        this.player.setTint(0x00ff00); // 第一次跳跃：绿色
      } else if (this.jumpCount === 2) {
        this.player.setTint(0xffff00); // 第二次跳跃：黄色
      }
    }
  }

  updateJumpText() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    const status = this.player.body.touching.down ? '着地' : '空中';
    
    this.jumpText.setText([
      `状态: ${status}`,
      `剩余跳跃次数: ${remainingJumps}/${this.maxJumps}`,
      `总跳跃次数: ${this.totalJumps}`
    ]);

    // 着地时恢复原色
    if (this.player.body.touching.down && this.jumpCount === 0) {
      this.player.clearTint();
    }
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
      gravity: { y: 400 }, // 重力设置为400
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);