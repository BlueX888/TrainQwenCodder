class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.isInvincible = false;
    this.invincibleDuration = 2500; // 2.5秒
  }

  preload() {
    // 使用 Graphics 创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人，使其移动
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(
        100 + i * 250,
        100 + i * 50,
        'enemy'
      );
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量UI
    this.healthText = this.add.text(16, 16, `血量: ${this.health}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    this.healthText.setDepth(100);

    // 创建状态文本（用于显示无敌状态）
    this.statusText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#00ffff',
      fontFamily: 'Arial'
    });
    this.statusText.setDepth(100);

    // 创建游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, '游戏结束！', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
    this.gameOverText.setDepth(100);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(16, 550, '方向键移动，躲避红色敌人', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.healthText.setText(`血量: ${this.health}`);

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.enterInvincibleState();
  }

  enterInvincibleState() {
    this.isInvincible = true;
    this.statusText.setText('无敌状态');

    // 保存原始颜色
    const originalTint = this.player.tint;

    // 创建青色闪烁效果
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: { from: 1, to: 0.3 },
      tint: 0x00ffff, // 青色
      duration: 200,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 2.5秒后解除无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.exitInvincibleState();
    });
  }

  exitInvincibleState() {
    this.isInvincible = false;
    this.statusText.setText('');

    // 停止闪烁动画
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 恢复原始外观
    this.player.setAlpha(1);
    this.player.setTint(0xffffff); // 恢复原色（绿色纹理）
  }

  gameOver() {
    // 停止物理引擎
    this.physics.pause();

    // 停止无敌动画（如果存在）
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 恢复玩家外观
    this.player.setAlpha(1);
    this.player.setTint(0xff0000); // 变红表示死亡

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.statusText.setText('');

    // 添加重启提示
    const restartText = this.add.text(400, 370, '点击任意位置重启', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });
    restartText.setOrigin(0.5);
    restartText.setDepth(100);

    // 点击重启
    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 如果游戏结束，不处理移动
    if (this.health <= 0) {
      return;
    }

    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
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