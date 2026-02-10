// 游戏场景类
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 8;
    this.maxHealth = 8;
    this.isInvincible = false;
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
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.health,
      maxHealth: this.maxHealth,
      isInvincible: false,
      collisionCount: 0,
      gameOver: false,
      events: []
    };

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人在不同位置
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
      // 给每个敌人随机速度
      enemy.setVelocity(
        Phaser.Math.Between(-150, 150),
        Phaser.Math.Between(-150, 150)
      );
    });

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建血量条背景
    this.healthBarBg = this.add.graphics();
    this.healthBarBg.fillStyle(0x000000, 0.8);
    this.healthBarBg.fillRect(20, 20, 210, 30);

    // 创建血量条
    this.healthBar = this.add.graphics();
    this.updateHealthBar();

    // 创建血量文本
    this.healthText = this.add.text(240, 25, `HP: ${this.health}/${this.maxHealth}`, {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // 创建提示文本
    this.add.text(400, 550, '使用方向键移动玩家（绿色方块）', {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建状态文本
    this.statusText = this.add.text(400, 580, '', {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 记录创建事件
    this.logEvent('game_start', { health: this.health });
  }

  update(time, delta) {
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

    // 更新状态文本
    if (this.isInvincible) {
      this.statusText.setText('无敌状态中...');
    } else {
      this.statusText.setText('');
    }

    // 更新信号
    window.__signals__.health = this.health;
    window.__signals__.isInvincible = this.isInvincible;
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不处理碰撞
    if (this.isInvincible) {
      return;
    }

    // 扣除生命值
    this.health -= 1;
    this.collisionCount += 1;

    // 记录碰撞事件
    this.logEvent('collision', {
      health: this.health,
      collisionCount: this.collisionCount,
      enemyPos: { x: Math.round(enemy.x), y: Math.round(enemy.y) }
    });

    // 更新血量条
    this.updateHealthBar();
    this.healthText.setText(`HP: ${this.health}/${this.maxHealth}`);

    // 检查是否死亡
    if (this.health <= 0) {
      this.handleGameOver();
      return;
    }

    // 进入无敌状态
    this.startInvincibility();
  }

  startInvincibility() {
    this.isInvincible = true;
    window.__signals__.isInvincible = true;

    // 创建闪烁效果
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复10次，总共1秒
      onComplete: () => {
        this.player.alpha = 1;
        this.isInvincible = false;
        window.__signals__.isInvincible = false;
        this.logEvent('invincibility_end', { health: this.health });
      }
    });

    // 记录无敌开始
    this.logEvent('invincibility_start', { health: this.health });
  }

  updateHealthBar() {
    // 清除旧的血量条
    this.healthBar.clear();

    // 计算血量百分比
    const healthPercent = this.health / this.maxHealth;
    const barWidth = 200 * healthPercent;

    // 根据血量选择颜色
    let color;
    if (healthPercent > 0.6) {
      color = 0x00ff00; // 绿色
    } else if (healthPercent > 0.3) {
      color = 0xffff00; // 黄色
    } else {
      color = 0xff0000; // 红色
    }

    // 绘制血量条
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(25, 25, barWidth, 20);
  }

  handleGameOver() {
    this.isInvincible = true; // 防止重复触发
    window.__signals__.gameOver = true;

    // 记录游戏结束
    this.logEvent('game_over', {
      health: 0,
      collisionCount: this.collisionCount
    });

    // 停止所有敌人
    this.enemies.children.entries.forEach(enemy => {
      enemy.setVelocity(0, 0);
    });

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const statsText = this.add.text(400, 370, `碰撞次数: ${this.collisionCount}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 输出最终信号
    console.log('Final Signals:', JSON.stringify(window.__signals__, null, 2));
  }

  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    window.__signals__.events.push(event);
    window.__signals__.collisionCount = this.collisionCount;
    console.log(`[Event] ${eventType}:`, JSON.stringify(data));
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