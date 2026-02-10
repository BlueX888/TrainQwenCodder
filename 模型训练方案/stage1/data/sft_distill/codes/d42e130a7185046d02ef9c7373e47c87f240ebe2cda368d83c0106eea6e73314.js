// 平台跳跃游戏场景类
class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0; // 可验证状态：跳跃次数
    this.isGrounded = false; // 是否在地面上
  }

  preload() {
    // 使用 Graphics 创建角色纹理
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 使用 Graphics 创建地面纹理
    const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 200, 40);
    groundGraphics.generateTexture('ground', 200, 40);
    groundGraphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.body.setGravityY(600); // 设置重力

    // 创建静态地面平台组
    this.platforms = this.physics.add.staticGroup();
    
    // 添加主地面
    const ground = this.platforms.create(400, 580, 'ground');
    ground.setScale(4, 1).refreshBody();
    
    // 添加几个悬浮平台
    this.platforms.create(200, 450, 'ground');
    this.platforms.create(600, 400, 'ground');
    this.platforms.create(400, 300, 'ground').setScale(1.5, 1).refreshBody();
    this.platforms.create(100, 200, 'ground');
    this.platforms.create(700, 250, 'ground');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 50, '← → 移动 | SPACE/↑ 跳跃', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    console.log('平台跳跃游戏已初始化');
  }

  update(time, delta) {
    // 更新接地状态（每帧检查）
    this.isGrounded = this.player.body.touching.down;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300); // 向左移动，速度 300
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300); // 向右移动，速度 300
    } else {
      this.player.setVelocityX(0); // 停止移动
    }

    // 跳跃控制（空格键或上方向键）
    const jumpKeyPressed = Phaser.Input.Keyboard.JustDown(this.spaceKey) || 
                          Phaser.Input.Keyboard.JustDown(this.cursors.up);
    
    if (jumpKeyPressed && this.isGrounded) {
      this.player.setVelocityY(-500); // 跳跃速度
      this.jumpCount++; // 增加跳跃计数
      console.log('跳跃次数:', this.jumpCount);
    }

    // 更新状态文本
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `速度: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `接地: ${this.isGrounded ? '是' : '否'}`
    ]);
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
      gravity: { y: 0 }, // 全局重力设为 0，在玩家上单独设置
      debug: false
    }
  },
  scene: PlatformScene
};

// 创建游戏实例
const game = new Phaser.Game(config);