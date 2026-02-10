class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.cursors = null;
    this.wasd = null;
    this.isCaught = false;
    this.survivalTime = 0;
    this.statusText = null;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemyTex', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemyTex');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 创建状态文本
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(16, 560, '使用方向键或WASD移动 | 玩家速度: 192 | 敌人速度: 160', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    if (this.isCaught) {
      return;
    }

    // 更新生存时间
    this.survivalTime += delta;

    // 玩家移动逻辑
    const playerSpeed = 160 * 1.2; // 192
    this.player.setVelocity(0);

    let isMoving = false;

    // 检测方向键或WASD
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-playerSpeed);
      isMoving = true;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(playerSpeed);
      isMoving = true;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-playerSpeed);
      isMoving = true;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(playerSpeed);
      isMoving = true;
    }

    // 如果同时按下两个方向，需要归一化速度
    if (isMoving) {
      this.player.body.velocity.normalize().scale(playerSpeed);
    }

    // 敌人追踪玩家
    const enemySpeed = 160;
    this.physics.moveToObject(this.enemy, this.player, enemySpeed);

    // 更新状态文本
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );
    
    this.statusText.setText(
      `生存时间: ${(this.survivalTime / 1000).toFixed(1)}s | 距离敌人: ${distance.toFixed(0)}px`
    );
  }

  onCatch() {
    if (this.isCaught) return;

    this.isCaught = true;

    // 停止所有移动
    this.player.setVelocity(0);
    this.enemy.setVelocity(0);

    // 显示结果
    const resultText = this.add.text(400, 300, 
      `被抓住了！\n生存时间: ${(this.survivalTime / 1000).toFixed(2)}秒\n\n点击重新开始`, 
      {
        fontSize: '32px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    resultText.setOrigin(0.5);

    // 添加重新开始功能
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });

    console.log('Game Over - Survival Time:', this.survivalTime / 1000, 'seconds');
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

new Phaser.Game(config);