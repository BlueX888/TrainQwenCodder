class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 240 * 1.2; // 288
    this.enemySpeed = 240;
    this.distance = 0; // 可验证状态：玩家与敌人距离
    this.isCaught = false; // 可验证状态：是否被抓住
    this.survivalTime = 0; // 可验证状态：存活时间（秒）
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, '使用方向键移动 | 玩家速度: 288 | 敌人速度: 240', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  update(time, delta) {
    if (this.isCaught) {
      return; // 游戏结束，停止更新
    }

    // 更新存活时间
    this.survivalTime += delta / 1000;

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = this.playerSpeed / Math.sqrt(2);
      this.player.body.velocity.normalize().scale(normalizedSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    this.distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新状态文本
    this.statusText.setText([
      `距离: ${Math.floor(this.distance)}`,
      `存活时间: ${this.survivalTime.toFixed(1)}秒`,
      `状态: ${this.isCaught ? '被抓住!' : '逃跑中'}`,
      `玩家速度: ${this.playerSpeed} | 敌人速度: ${this.enemySpeed}`
    ]);
  }

  onCatch() {
    if (!this.isCaught) {
      this.isCaught = true;
      this.player.setTint(0xff0000); // 玩家变红表示被抓
      this.enemy.setVelocity(0); // 停止敌人移动

      // 显示游戏结束文本
      this.add.text(400, 300, '被抓住了！', {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);

      this.add.text(400, 360, `存活时间: ${this.survivalTime.toFixed(1)}秒`, {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 }
      }).setOrigin(0.5);

      console.log('Game Over - Caught!');
      console.log('Survival Time:', this.survivalTime.toFixed(1), 'seconds');
      console.log('Final Distance:', Math.floor(this.distance));
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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