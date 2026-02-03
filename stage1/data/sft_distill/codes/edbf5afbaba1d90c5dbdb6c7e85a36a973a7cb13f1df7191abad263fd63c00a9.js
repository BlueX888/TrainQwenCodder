class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
    this.invincibleDuration = 500; // 0.5秒
    this.collisionCount = 0;
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
    enemyGraphics.fillRect(0, 0, 35, 35);
    enemyGraphics.generateTexture('enemy', 35, 35);
    enemyGraphics.destroy();

    // 创建心形纹理（血量显示）
    const heartGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    heartGraphics.fillStyle(0xff0000, 1);
    heartGraphics.fillRect(0, 0, 20, 20);
    heartGraphics.generateTexture('heart', 20, 20);
    heartGraphics.destroy();
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      health: this.health,
      maxHealth: this.maxHealth,
      collisions: [],
      invincibleActivations: [],
      gameOver: false
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 添加3个敌人
    for (let i = 0; i < 3; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
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

    // 创建血量显示
    this.hearts = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const heart = this.add.image(30 + i * 30, 30, 'heart');
      this.hearts.push(heart);
    }

    // 创建血量文本
    this.healthText = this.add.text(16, 60, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#fff'
    });

    // 创建无敌状态文本
    this.invincibleText = this.add.text(16, 90, '', {
      fontSize: '18px',
      fill: '#ffff00'
    });

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 游戏状态文本
    this.statusText = this.add.text(16, 120, 'Use arrow keys to move\nAvoid red enemies!', {
      fontSize: '16px',
      fill: '#fff'
    });

    console.log('[Game] Initialized - Health:', this.health);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣血
    this.health--;
    this.collisionCount++;

    // 记录碰撞事件
    const collisionEvent = {
      time: this.time.now,
      healthAfter: this.health,
      collisionNumber: this.collisionCount,
      enemyPosition: { x: enemy.x, y: enemy.y }
    };
    window.__signals__.collisions.push(collisionEvent);
    window.__signals__.health = this.health;

    console.log(`[Collision] #${this.collisionCount} - Health: ${this.health}/${this.maxHealth}`);

    // 更新血量显示
    this.updateHealthDisplay();

    // 如果还有血量，触发无敌状态
    if (this.health > 0) {
      this.activateInvincibility();
    } else {
      this.gameOver();
    }
  }

  activateInvincibility() {
    this.isInvincible = true;
    
    // 记录无敌激活
    window.__signals__.invincibleActivations.push({
      time: this.time.now,
      duration: this.invincibleDuration
    });

    console.log('[Invincible] Activated for', this.invincibleDuration, 'ms');

    // 更新无敌状态文本
    this.invincibleText.setText('INVINCIBLE!');

    // 创建闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 4, // 闪烁5次（0.5秒）
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvincible = false;
        this.invincibleText.setText('');
        console.log('[Invincible] Deactivated');
      }
    });
  }

  updateHealthDisplay() {
    // 更新心形显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        this.hearts[i].setAlpha(1);
      } else {
        this.hearts[i].setAlpha(0.2);
      }
    }

    // 更新文本
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);
  }

  gameOver() {
    console.log('[Game] Game Over - Total Collisions:', this.collisionCount);
    
    window.__signals__.gameOver = true;

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.player.setTint(0x666666);

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    this.statusText.setText('GAME OVER!\nYou were hit ' + this.collisionCount + ' times');
    this.statusText.setFontSize('24px');
    this.statusText.setColor('#ff0000');

    // 禁用输入
    this.input.keyboard.enabled = false;
  }

  update(time, delta) {
    // 游戏结束后不更新
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

    // 敌人随机改变方向（每2秒）
    if (time % 2000 < delta) {
      this.enemies.children.entries.forEach(enemy => {
        if (Phaser.Math.Between(0, 1) === 1) {
          enemy.setVelocity(
            Phaser.Math.Between(-100, 100),
            Phaser.Math.Between(-100, 100)
          );
        }
      });
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

const game = new Phaser.Game(config);