class PlatformScene extends Phaser.Scene {
  constructor() {
    super('PlatformScene');
    this.jumpCount = 0;
    this.survivalTime = 0;
    this.isGameOver = false;
  }

  preload() {
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

    // 创建地面纹理
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x8b4513, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();
  }

  create() {
    // 重置状态
    this.jumpCount = 0;
    this.survivalTime = 0;
    this.isGameOver = false;

    // 创建地面（起始平台）
    this.ground = this.physics.add.sprite(400, 580, 'ground');
    this.ground.setImmovable(true);
    this.ground.body.allowGravity = false;

    // 创建3个移动平台
    this.platforms = this.physics.add.group();
    
    // 平台1：从左向右移动，中低位置
    const platform1 = this.platforms.create(200, 450, 'platform');
    platform1.setImmovable(true);
    platform1.body.allowGravity = false;
    platform1.setVelocityX(120);
    platform1.setBounce(1, 0);
    platform1.setCollideWorldBounds(true);

    // 平台2：从右向左移动，中高位置
    const platform2 = this.platforms.create(600, 320, 'platform');
    platform2.setImmovable(true);
    platform2.body.allowGravity = false;
    platform2.setVelocityX(-120);
    platform2.setBounce(1, 0);
    platform2.setCollideWorldBounds(true);

    // 平台3：从左向右移动，高位置
    const platform3 = this.platforms.create(300, 190, 'platform');
    platform3.setImmovable(true);
    platform3.body.allowGravity = false;
    platform3.setVelocityX(120);
    platform3.setBounce(1, 0);
    platform3.setCollideWorldBounds(true);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(600);

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.platforms);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 提示文本
    this.add.text(400, 50, 'Use Arrow Keys to Move, SPACE/UP to Jump', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    // 目标文本
    this.add.text(400, 80, 'Goal: Jump across all 3 moving platforms!', {
      fontSize: '16px',
      fill: '#00ff00'
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 计时器
    this.time.addEvent({
      delay: 100,
      callback: () => {
        if (!this.isGameOver) {
          this.survivalTime += 0.1;
        }
      },
      loop: true
    });
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 检查玩家是否掉出屏幕
    if (this.player.y > 600) {
      this.gameOver();
      return;
    }

    // 水平移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 跳跃（只能在地面或平台上跳跃）
    if ((this.cursors.up.isDown || this.spaceKey.isDown) && this.player.body.touching.down) {
      this.player.setVelocityY(-400);
      this.jumpCount++;
    }

    // 更新状态显示
    this.statusText.setText([
      `Jumps: ${this.jumpCount}`,
      `Time: ${this.survivalTime.toFixed(1)}s`,
      `Position: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`,
      `On Ground: ${this.player.body.touching.down ? 'Yes' : 'No'}`
    ]);

    // 检查是否到达顶部平台（胜利条件）
    if (this.player.y < 200 && this.player.body.touching.down) {
      this.victory();
    }
  }

  gameOver() {
    this.isGameOver = true;
    this.player.setTint(0xff0000);
    this.gameOverText.setText([
      'GAME OVER!',
      `Jumps: ${this.jumpCount}`,
      `Time: ${this.survivalTime.toFixed(1)}s`,
      '',
      'Press R to Restart'
    ]).setVisible(true);

    // 重启键
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  victory() {
    this.isGameOver = true;
    this.player.setTint(0x00ff00);
    this.gameOverText.setText([
      'VICTORY!',
      `Jumps: ${this.jumpCount}`,
      `Time: ${this.survivalTime.toFixed(1)}s`,
      '',
      'Press R to Restart'
    ]).setFill('#00ff00').setVisible(true);

    // 重启键
    this.input.keyboard.once('keydown-R', () => {
      this.scene.restart();
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
  scene: PlatformScene
};

new Phaser.Game(config);