class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.jumpCount = 0;
    this.survivalTime = 0;
    this.isGameOver = false;
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
    platformGraphics.fillRect(0, 0, 120, 20);
    platformGraphics.generateTexture('platform', 120, 20);
    platformGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(100, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.body.setGravityY(800);

    // 创建移动平台组
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 创建3个平台，形成路径
    const platform1 = this.platforms.create(200, 450, 'platform');
    const platform2 = this.platforms.create(400, 350, 'platform');
    const platform3 = this.platforms.create(600, 450, 'platform');

    // 设置平台1：水平往返移动
    this.tweens.add({
      targets: platform1,
      x: 350,
      duration: 2000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });

    // 设置平台2：垂直往返移动
    this.tweens.add({
      targets: platform2,
      y: 250,
      duration: 1500,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });

    // 设置平台3：水平往返移动（反向）
    this.tweens.add({
      targets: platform3,
      x: 450,
      duration: 2000,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.platforms);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态显示文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏说明
    this.add.text(400, 50, '按空格键跳跃，通过移动平台！', {
      fontSize: '20px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 地面（起始平台）
    const ground = this.platforms.create(100, 550, 'platform');
    ground.setScale(2, 1);
    ground.refreshBody();

    console.log('Game initialized - Jump count:', this.jumpCount);
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // 更新存活时间
    this.survivalTime += delta;

    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃控制
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.player.body.touching.down) {
        this.player.setVelocityY(-400);
        this.jumpCount++;
        console.log('Jump! Total jumps:', this.jumpCount);
      }
    }

    // 检测掉落
    if (this.player.y > 600) {
      this.gameOver();
    }

    // 更新状态显示
    this.updateStatus();
  }

  updateStatus() {
    const timeInSeconds = Math.floor(this.survivalTime / 1000);
    this.statusText.setText([
      `跳跃次数: ${this.jumpCount}`,
      `存活时间: ${timeInSeconds}s`,
      `玩家位置: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`
    ]);
  }

  gameOver() {
    if (this.isGameOver) return;
    
    this.isGameOver = true;
    this.physics.pause();
    this.player.setTint(0xff0000);

    const timeInSeconds = Math.floor(this.survivalTime / 1000);
    
    this.add.text(400, 300, '游戏结束！', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.add.text(400, 360, `跳跃次数: ${this.jumpCount} | 存活时间: ${timeInSeconds}s`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    console.log('Game Over! Final stats:', {
      jumpCount: this.jumpCount,
      survivalTime: timeInSeconds,
      finalPosition: { x: this.player.x, y: this.player.y }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);