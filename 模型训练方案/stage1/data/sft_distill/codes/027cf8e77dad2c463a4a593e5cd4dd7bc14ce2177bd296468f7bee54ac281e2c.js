// 双跳功能实现
class DoubleJumpScene extends Phaser.Scene {
  constructor() {
    super('DoubleJumpScene');
    this.jumpCount = 0; // 当前已跳跃次数
    this.maxJumps = 2; // 最大跳跃次数
    this.jumpVelocity = -300; // 跳跃力度
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 60);
    playerGraphics.generateTexture('player', 40, 60);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8B4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x666666, 1);
    platformGraphics.fillRect(0, 0, 200, 20);
    platformGraphics.generateTexture('platform', 200, 20);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建地面
    this.ground = this.physics.add.staticSprite(400, 575, 'ground');

    // 创建几个平台用于测试
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(300, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(200, 250, 'platform');

    // 设置碰撞
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 说明文本
    this.instructionText = this.add.text(16, 60, 
      '操作说明:\n← → 移动\n空格键跳跃（可双跳）', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听玩家着地事件
    this.player.body.onWorldBounds = true;
    
    // 更新状态显示
    this.updateStatus();
  }

  update() {
    // 检测玩家是否在地面或平台上
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;

    // 如果在地面上，重置跳跃计数
    if (onGround) {
      this.jumpCount = 0;
    }

    // 左右移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃逻辑 - 使用 justDown 确保按一次只跳一次
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.jumpCount < this.maxJumps) {
        this.player.setVelocityY(this.jumpVelocity);
        this.jumpCount++;
        
        // 视觉反馈：第二次跳跃时改变颜色
        if (this.jumpCount === 2) {
          this.player.setTint(0xffff00); // 黄色表示二段跳
          this.time.delayedCall(200, () => {
            this.player.clearTint();
          });
        }
      }
    }

    // 更新状态显示
    this.updateStatus();
  }

  updateStatus() {
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const remainingJumps = this.maxJumps - this.jumpCount;
    
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}/${this.maxJumps}`,
      `剩余跳跃: ${remainingJumps}`,
      `状态: ${onGround ? '着地' : '空中'}`,
      `速度Y: ${Math.round(this.player.body.velocity.y)}`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 800 }, // 重力设置为800
      debug: false
    }
  },
  scene: DoubleJumpScene
};

// 启动游戏
new Phaser.Game(config);