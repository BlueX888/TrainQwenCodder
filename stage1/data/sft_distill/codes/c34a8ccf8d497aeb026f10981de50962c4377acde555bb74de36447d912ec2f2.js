class PlatformerScene extends Phaser.Scene {
  constructor() {
    super('PlatformerScene');
    this.jumpCount = 0; // 可验证的状态信号
    this.isGrounded = false;
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 48);
    playerGraphics.generateTexture('player', 32, 48);
    playerGraphics.destroy();

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 50);
    groundGraphics.generateTexture('ground', 800, 50);
    groundGraphics.destroy();

    // 创建平台纹理
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 0, 200, 30);
    platformGraphics.generateTexture('platform', 200, 30);
    platformGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(200); // 设置重力

    // 创建静态平台组
    this.platforms = this.physics.add.staticGroup();

    // 添加地面
    this.platforms.create(400, 575, 'ground').setScale(1).refreshBody();

    // 添加多个平台
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 350, 'platform');
    this.platforms.create(150, 250, 'platform');
    this.platforms.create(600, 200, 'platform');

    // 设置玩家与平台的碰撞
    this.physics.add.collider(this.player, this.platforms, () => {
      this.isGrounded = true;
    });

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 添加文本显示跳跃次数
    this.jumpText = this.add.text(16, 16, 'Jumps: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加控制提示
    this.add.text(16, 50, 'Arrow Keys: Move | Space: Jump', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加状态显示
    this.statusText = this.add.text(16, 80, 'Grounded: false', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 检测是否在地面上
    this.isGrounded = this.player.body.touching.down;

    // 左右移动控制（速度 360）
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-360);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(360);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制（只能在地面上跳跃）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.isGrounded) {
      this.player.setVelocityY(-500);
      this.jumpCount++;
      this.jumpText.setText('Jumps: ' + this.jumpCount);
    }

    // 更新状态显示
    this.statusText.setText('Grounded: ' + this.isGrounded);
    this.statusText.setStyle({ fill: this.isGrounded ? '#00ff00' : '#ff0000' });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#87CEEB',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }, // 全局重力设为 0，在玩家身上单独设置
      debug: false
    }
  },
  scene: PlatformerScene
};

const game = new Phaser.Game(config);