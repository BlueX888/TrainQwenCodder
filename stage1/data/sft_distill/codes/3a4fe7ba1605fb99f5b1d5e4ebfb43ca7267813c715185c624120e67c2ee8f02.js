class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 20;
    this.maxHealth = 20;
    this.isInvincible = false;
    this.invincibleDuration = 4000; // 4秒无敌
    this.blinkInterval = 200; // 闪烁间隔
  }

  preload() {
    // 不需要加载外部资源
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

    // 创建敌人（多个敌人增加碰撞机会）
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人，设置不同的初始位置和速度
    for (let i = 0; i < 3; i++) {
      const enemy = this.enemies.create(100 + i * 250, 100, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(50, 150)
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

    // 创建血量显示文本
    this.healthText = this.add.text(16, 16, '', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.updateHealthDisplay();

    // 创建状态显示文本
    this.statusText = this.add.text(16, 56, '', {
      fontSize: '24px',
      fill: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    });

    // 创建控制提示
    this.add.text(16, 560, '使用方向键移动玩家', {
      fontSize: '20px',
      fill: '#cccccc',
      fontFamily: 'Arial'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 闪烁定时器引用
    this.blinkTimer = null;
  }

  update(time, delta) {
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

    // 检查游戏结束
    if (this.health <= 0 && this.player.active) {
      this.gameOver();
    }
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    this.updateHealthDisplay();

    console.log(`碰撞！当前血量: ${this.health}/${this.maxHealth}`);

    // 如果还有生命值，触发无敌状态
    if (this.health > 0) {
      this.startInvincibility();
    }
  }

  startInvincibility() {
    this.isInvincible = true;
    this.statusText.setText('无敌状态！');

    // 开始闪烁效果
    let blinkCount = 0;
    const maxBlinks = this.invincibleDuration / this.blinkInterval;

    this.blinkTimer = this.time.addEvent({
      delay: this.blinkInterval,
      callback: () => {
        // 切换透明度实现闪烁
        this.player.alpha = this.player.alpha === 1 ? 0.3 : 1;
        blinkCount++;

        // 闪烁结束
        if (blinkCount >= maxBlinks) {
          this.endInvincibility();
        }
      },
      loop: true
    });

    // 设置无敌结束定时器（保险机制）
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincibility();
    });
  }

  endInvincibility() {
    this.isInvincible = false;
    this.player.alpha = 1; // 恢复完全不透明
    this.statusText.setText('');

    // 清除闪烁定时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
      this.blinkTimer = null;
    }

    console.log('无敌状态结束');
  }

  updateHealthDisplay() {
    this.healthText.setText(`血量: ${this.health}/${this.maxHealth}`);
    
    // 根据血量改变颜色
    if (this.health > 15) {
      this.healthText.setFill('#00ff00'); // 绿色
    } else if (this.health > 10) {
      this.healthText.setFill('#ffff00'); // 黄色
    } else if (this.health > 5) {
      this.healthText.setFill('#ff9900'); // 橙色
    } else {
      this.healthText.setFill('#ff0000'); // 红色
    }
  }

  gameOver() {
    console.log('游戏结束！');
    
    // 停止玩家
    this.player.setActive(false);
    this.player.setVisible(false);

    // 停止所有敌人
    this.enemies.children.iterate((enemy) => {
      enemy.setVelocity(0);
    });

    // 清除闪烁定时器
    if (this.blinkTimer) {
      this.blinkTimer.remove();
    }

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, '游戏结束！', {
      fontSize: '64px',
      fill: '#ff0000',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    });
    gameOverText.setOrigin(0.5);

    const restartText = this.add.text(400, 380, '点击重新开始', {
      fontSize: '32px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    restartText.setOrigin(0.5);

    // 点击重启
    this.input.once('pointerdown', () => {
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
  scene: GameScene
};

new Phaser.Game(config);