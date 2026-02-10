class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证的状态信号：跳跃次数
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建地面纹理（绿色方块）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x00aa00, 1);
    groundGraphics.fillRect(0, 0, 64, 32);
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setBounce(0); // 不反弹
    this.player.setCollideWorldBounds(true); // 与世界边界碰撞

    // 创建地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    this.platforms.create(400, 568, 'ground').setScale(12.5, 1).refreshBody();
    
    // 添加几个跳跃平台
    this.platforms.create(600, 400, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(50, 250, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(750, 220, 'ground').setScale(2, 1).refreshBody();
    this.platforms.create(400, 150, 'ground').setScale(2, 1).refreshBody();

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      // 碰撞回调：检测是否着地
      if (this.player.body.touching.down) {
        this.isGrounded = true;
      }
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示跳跃计数文本
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 显示控制提示
    this.add.text(16, 50, 'Controls: Arrow Keys to move, Space to jump', {
      fontSize: '16px',
      fill: '#cccccc'
    });
  }

  update(time, delta) {
    // 重置着地状态（每帧检测）
    if (!this.player.body.touching.down) {
      this.isGrounded = false;
    }

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-80); // 移动速度 80
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(80);
    } else {
      this.player.setVelocityX(0); // 停止移动
    }

    // 跳跃控制（空格键或上方向键）
    if ((Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
         Phaser.Input.Keyboard.JustDown(this.cursors.up)) && 
        this.isGrounded) {
      this.player.setVelocityY(-330); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      this.jumpText.setText('Jumps: ' + this.jumpCount);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB', // 天空蓝背景
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }, // 重力设置为 300
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);