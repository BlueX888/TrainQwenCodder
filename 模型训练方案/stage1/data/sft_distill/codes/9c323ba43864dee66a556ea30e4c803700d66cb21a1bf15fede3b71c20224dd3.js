class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 3; // 可验证状态
    this.isInvincible = false;
    this.hitCount = 0; // 受击次数统计
  }

  preload() {
    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
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
    this.player.body.setDrag(200); // 设置阻力使击退平滑减速

    // 创建敌人（在四周随机位置）
    this.enemies = this.physics.add.group();
    const positions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 }
    ];
    
    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      // 敌人简单移动
      enemy.setVelocity(
        Phaser.Math.Between(-50, 50),
        Phaser.Math.Between(-50, 50)
      );
      enemy.setBounce(1);
    });

    // 碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 状态显示
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 提示文本
    this.add.text(400, 550, '使用方向键移动，碰到红色方块会受伤', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，忽略碰撞
    if (this.isInvincible) {
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;
    this.health--;
    this.hitCount++;
    this.updateStatusText();

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 施加击退速度（速度80相关，这里使用80作为基础击退速度）
    const knockbackSpeed = 80;
    const velocityX = Math.cos(angle) * knockbackSpeed;
    const velocityY = Math.sin(angle) * knockbackSpeed;
    
    player.setVelocity(velocityX, velocityY);

    // 闪烁效果 - 1秒内循环5次（每次0.2秒）
    const blinkTween = this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复9次，加上初始1次共10次变化（5个完整循环）
      onComplete: () => {
        player.alpha = 1; // 确保最后恢复为完全不透明
      }
    });

    // 击退效果 - 速度逐渐减少
    // 使用物理系统的阻力自然减速，或者用 Tween 控制
    this.tweens.add({
      targets: player.body.velocity,
      x: 0,
      y: 0,
      duration: 300, // 击退持续300ms
      ease: 'Quad.easeOut'
    });

    // 1秒后恢复正常状态
    this.time.delayedCall(1000, () => {
      this.isInvincible = false;
      player.alpha = 1; // 确保恢复可见
      this.updateStatusText();
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.gameOver();
    }
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? ' [无敌中]' : '';
    this.statusText.setText(
      `生命值: ${this.health} | 受击次数: ${this.hitCount}${invincibleStatus}`
    );
  }

  gameOver() {
    this.physics.pause();
    this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    this.add.text(400, 360, `总共受击 ${this.hitCount} 次`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  update() {
    // 玩家移动控制（只在非无敌或游戏未结束时响应）
    if (this.health > 0) {
      const speed = 160;
      
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