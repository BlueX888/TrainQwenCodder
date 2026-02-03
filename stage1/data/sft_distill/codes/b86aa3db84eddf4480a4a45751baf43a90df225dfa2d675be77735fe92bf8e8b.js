class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 15;
    this.maxHealth = 15;
    this.isInvincible = false;
    this.invincibleDuration = 1000; // 1秒无敌时间
  }

  preload() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建无敌状态纹理（橙色方块）
    const invincibleGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    invincibleGraphics.fillStyle(0xff8800, 1);
    invincibleGraphics.fillRect(0, 0, 40, 40);
    invincibleGraphics.generateTexture('playerInvincible', 40, 40);
    invincibleGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人，随机位置和速度
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 300);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1, 1);
      
      // 设置随机速度
      const velocityX = Phaser.Math.Between(-150, 150);
      const velocityY = Phaser.Math.Between(-150, 150);
      enemy.setVelocity(velocityX, velocityY);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量显示文本
    this.healthText = this.add.text(16, 16, `Health: ${this.health}/${this.maxHealth}`, {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 创建无敌状态提示文本
    this.invincibleText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#ff8800',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 创建游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.add.text(16, 560, 'Arrow Keys to Move - Avoid Red Enemies!', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });
  }

  update(time, delta) {
    // 如果游戏结束，停止更新
    if (this.health <= 0) {
      return;
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

    // 扣除生命值
    this.health -= 1;
    this.updateHealthDisplay();

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleGameOver();
      return;
    }

    // 触发无敌状态
    this.activateInvincibility();
  }

  activateInvincibility() {
    this.isInvincible = true;

    // 切换到橙色纹理
    this.player.setTexture('playerInvincible');

    // 更新无敌状态提示
    this.invincibleText.setText('INVINCIBLE!');

    // 创建闪烁效果（透明度变化）
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复9次，共10次变化，约1秒
      onComplete: () => {
        // 恢复正常状态
        this.player.setAlpha(1);
        this.player.setTexture('player');
        this.isInvincible = false;
        this.invincibleText.setText('');
      }
    });
  }

  updateHealthDisplay() {
    this.healthText.setText(`Health: ${this.health}/${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.health <= 3) {
      this.healthText.setFill('#ff0000'); // 低血量红色
    } else if (this.health <= 7) {
      this.healthText.setFill('#ffaa00'); // 中等血量橙色
    } else {
      this.healthText.setFill('#ffffff'); // 高血量白色
    }
  }

  handleGameOver() {
    // 停止所有敌人移动
    this.enemies.getChildren().forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

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

    // 显示最终血量
    this.healthText.setText(`Health: 0/${this.maxHealth}`);
    this.healthText.setFill('#ff0000');
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