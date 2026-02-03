class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 12;
    this.maxHealth = 12;
    this.isInvincible = false;
    this.player = null;
    this.enemy = null;
    this.healthBar = null;
    this.healthText = null;
    this.gameOverText = null;
  }

  preload() {
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
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（可移动）
    this.enemy = this.physics.add.sprite(200, 200, 'enemy');
    this.enemy.setVelocity(100, 100);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 创建血量条背景
    const healthBarBg = this.add.graphics();
    healthBarBg.fillStyle(0x666666, 1);
    healthBarBg.fillRect(50, 30, 240, 30);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(300, 35, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建控制提示
    this.add.text(50, 550, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化游戏结束文本（隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);
  }

  update() {
    if (this.health <= 0) {
      return; // 游戏结束，停止更新
    }

    // 玩家移动控制
    const speed = 200;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health -= 1;
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 触发无敌帧
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;

    // 改变玩家颜色为橙色
    this.player.setTint(0xffa500);

    // 创建闪烁效果（透明度切换）
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共0.5秒（100ms * 2 * 5 = 1000ms，但我们要0.5秒，所以调整为100ms*10=500ms）
      onComplete: () => {
        // 恢复正常状态
        this.player.alpha = 1;
        this.player.clearTint();
        this.isInvincible = false;
      }
    });

    // 备用计时器（确保0.5秒后恢复）
    this.time.delayedCall(500, () => {
      if (this.isInvincible) {
        this.player.alpha = 1;
        this.player.clearTint();
        this.isInvincible = false;
      }
    });
  }

  updateHealthBar() {
    this.healthBar.clear();
    
    // 根据血量百分比计算颜色
    const healthPercent = this.health / this.maxHealth;
    let color;
    if (healthPercent > 0.5) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.25) {
      color = 0xffff00; // 黄色
    } else {
      color = 0xff0000; // 红色
    }

    // 绘制血量条
    this.healthBar.fillStyle(color, 1);
    const barWidth = 240 * healthPercent;
    this.healthBar.fillRect(50, 30, barWidth, 30);
  }

  gameOver() {
    // 停止敌人移动
    this.enemy.setVelocity(0, 0);
    
    // 停止玩家移动
    this.player.setVelocity(0, 0);
    
    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    
    // 添加闪烁效果
    this.tweens.add({
      targets: this.gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 禁用输入
    this.cursors.left.enabled = false;
    this.cursors.right.enabled = false;
    this.cursors.up.enabled = false;
    this.cursors.down.enabled = false;
  }
}

// 游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);