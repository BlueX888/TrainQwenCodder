class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3;
    this.maxHealth = 3;
    this.isInvincible = false;
    this.invincibleDuration = 2500; // 2.5秒
  }

  preload() {
    // 创建玩家纹理（青色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ffff, 1); // 青色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建3个敌人
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

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建血量UI
    this.createHealthUI();

    // 添加说明文字
    this.add.text(10, 10, '使用方向键移动\n碰撞敌人扣1血，2.5秒无敌（闪烁）', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });

    // 当前无敌状态文本
    this.invincibleText = this.add.text(10, 550, '', {
      fontSize: '18px',
      fill: '#00ffff',
      fontStyle: 'bold'
    });
  }

  createHealthUI() {
    // 血量文字
    this.healthText = this.add.text(650, 10, `生命值: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      fill: '#ffffff',
      fontStyle: 'bold'
    });

    // 血量条容器
    this.healthBarContainer = this.add.container(650, 45);
    
    // 血量方块
    this.healthBlocks = [];
    for (let i = 0; i < this.maxHealth; i++) {
      const block = this.add.graphics();
      block.fillStyle(0xff0000, 1);
      block.fillRect(i * 45, 0, 40, 30);
      this.healthBarContainer.add(block);
      this.healthBlocks.push(block);
    }
  }

  updateHealthUI() {
    this.healthText.setText(`生命值: ${this.health}/${this.maxHealth}`);
    
    // 更新血量方块显示
    for (let i = 0; i < this.maxHealth; i++) {
      if (i < this.health) {
        this.healthBlocks[i].setAlpha(1);
      } else {
        this.healthBlocks[i].setAlpha(0.2);
      }
    }
  }

  handleCollision(player, enemy) {
    // 如果正在无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    this.updateHealthUI();

    console.log(`碰撞！剩余生命值: ${this.health}`);

    // 检查是否死亡
    if (this.health <= 0) {
      this.gameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincible();
  }

  startInvincible() {
    this.isInvincible = true;
    this.invincibleText.setText('无敌状态中...');

    // 创建闪烁效果
    this.blinkTween = this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: -1 // 无限循环
    });

    // 2.5秒后解除无敌状态
    this.time.delayedCall(this.invincibleDuration, () => {
      this.endInvincible();
    });
  }

  endInvincible() {
    this.isInvincible = false;
    this.invincibleText.setText('');

    // 停止闪烁效果
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 恢复完全不透明
    this.player.setAlpha(1);

    console.log('无敌状态结束');
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 停止闪烁
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 显示游戏结束文字
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 380, '刷新页面重新开始', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.invincibleText.setText('');

    console.log('游戏结束！');
  }

  update(time, delta) {
    // 如果游戏结束，不再更新
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

    // 敌人随机改变方向（每2秒有机会改变）
    this.enemies.children.entries.forEach(enemy => {
      if (Phaser.Math.Between(0, 100) < 2) {
        enemy.setVelocity(
          Phaser.Math.Between(-100, 100),
          Phaser.Math.Between(-100, 100)
        );
      }
    });
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
new Phaser.Game(config);