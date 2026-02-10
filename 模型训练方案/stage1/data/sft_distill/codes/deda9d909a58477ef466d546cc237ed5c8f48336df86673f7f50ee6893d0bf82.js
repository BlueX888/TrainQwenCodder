class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
    this.invincibleDuration = 2500; // 2.5秒
  }

  preload() {
    // 使用Graphics创建纹理，不依赖外部资源
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
    enemyGraphics.fillRect(0, 0, 35, 35);
    enemyGraphics.generateTexture('enemy', 35, 35);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 添加多个敌人
    for (let i = 0; i < 5; i++) {
      const x = 100 + i * 150;
      const y = 100 + (i % 2) * 100;
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量UI
    this.createHealthUI();

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(10, 10, '使用方向键移动\n碰撞扣1血，无敌2.5秒（青色闪烁）', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 游戏状态文本
    this.statusText = this.add.text(10, 550, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });
  }

  createHealthUI() {
    // 清除旧的血量UI
    if (this.healthUI) {
      this.healthUI.forEach(heart => heart.destroy());
    }

    this.healthUI = [];
    
    // 创建心形图形（简化为红色方块）
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.graphics();
      const x = 650 + i * 50;
      const y = 20;
      
      if (i < this.health) {
        // 有血量：红色
        heart.fillStyle(0xff0000, 1);
      } else {
        // 无血量：灰色
        heart.fillStyle(0x666666, 1);
      }
      
      heart.fillRect(x, y, 35, 35);
      this.healthUI.push(heart);
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    
    // 更新血量UI
    this.createHealthUI();

    // 更新状态文本
    this.statusText.setText(`受到伤害！剩余血量: ${this.health}`);

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 创建闪烁效果（青色提示）
    this.invincibleTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      tint: 0x00ffff, // 青色
      duration: 150,
      yoyo: true,
      repeat: -1 // 无限重复
    });

    // 2.5秒后结束无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  endInvincibility() {
    this.isInvincible = false;

    // 停止闪烁效果
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 恢复玩家外观
    this.player.setAlpha(1);
    this.player.clearTint();

    // 更新状态文本
    this.statusText.setText('无敌状态结束');
  }

  gameOver() {
    // 停止所有物理运动
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000'
    });
    gameOverText.setOrigin(0.5);

    this.statusText.setText('血量耗尽！游戏结束');

    // 停止无敌效果
    if (this.invincibleTween) {
      this.invincibleTween.stop();
    }

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    // 如果游戏结束，不处理输入
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