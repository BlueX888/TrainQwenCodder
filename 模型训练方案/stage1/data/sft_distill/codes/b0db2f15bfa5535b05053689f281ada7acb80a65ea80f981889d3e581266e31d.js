class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -200; // 跳跃力度
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建地面（静态物理对象）
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');
    this.ground.setDisplaySize(800, 50);
    this.ground.refreshBody();

    // 创建玩家（动态物理对象）
    this.player = this.physics.add.sprite(100, 400, 'player');
    this.player.setDisplaySize(40, 40);
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);

    // 设置玩家与地面的碰撞
    this.physics.add.collider(this.player, this.ground, () => {
      // 当玩家接触地面时，重置跳跃次数
      if (this.player.body.touching.down) {
        this.jumpCount = 0;
        this.updateJumpText();
      }
    });

    // 创建键盘输入
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示跳跃状态信息
    this.jumpText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateJumpText();

    // 显示操作提示
    this.add.text(16, 60, '按空格键跳跃（可连跳2次）', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示水平移动提示
    this.add.text(16, 100, '左右方向键移动', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 用于跟踪空格键是否刚被按下（防止长按连续跳跃）
    this.isSpaceJustPressed = false;
  }

  update(time, delta) {
    // 水平移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performJump();
    }
  }

  performJump() {
    // 检查是否还有剩余跳跃次数
    if (this.jumpCount < this.maxJumps) {
      this.player.setVelocityY(this.jumpVelocity);
      this.jumpCount++;
      this.updateJumpText();
      
      // 添加视觉反馈（改变颜色）
      this.player.setTint(this.jumpCount === 1 ? 0x00ff00 : 0xffff00);
      
      // 0.1秒后恢复颜色
      this.time.delayedCall(100, () => {
        this.player.clearTint();
      });
    }
  }

  updateJumpText() {
    const remainingJumps = this.maxJumps - this.jumpCount;
    this.jumpText.setText(`剩余跳跃次数: ${remainingJumps}/${this.maxJumps}`);
    
    // 根据剩余次数改变文本颜色
    if (remainingJumps === 0) {
      this.jumpText.setColor('#ff0000');
    } else if (remainingJumps === 1) {
      this.jumpText.setColor('#ffff00');
    } else {
      this.jumpText.setColor('#00ff00');
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87ceeb',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);