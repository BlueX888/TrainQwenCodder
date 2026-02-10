// 全局信号记录
window.__signals__ = {
  collisions: [],
  playerHealth: 100,
  knockbackEvents: [],
  blinkEvents: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isInvulnerable = false;
    this.playerHealth = 100;
  }

  preload() {
    // 创建青色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ffff, 1); // 青色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();
  }

  create() {
    // 创建玩家（青色角色）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(200, 0); // 以速度200向右移动
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.onCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示说明
    this.add.text(10, 550, '使用方向键移动青色角色，碰撞红色敌人时触发受伤效果', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    this.updateStatus();
  }

  onCollision(player, enemy) {
    // 如果正在无敌状态，不触发受伤
    if (this.isInvulnerable) {
      return;
    }

    // 设置无敌状态
    this.isInvulnerable = true;

    // 扣除生命值
    this.playerHealth -= 10;
    window.__signals__.playerHealth = this.playerHealth;

    // 记录碰撞事件
    const collisionData = {
      timestamp: Date.now(),
      playerPos: { x: player.x, y: player.y },
      enemyPos: { x: enemy.x, y: enemy.y },
      enemyVelocity: { x: enemy.body.velocity.x, y: enemy.body.velocity.y },
      healthAfter: this.playerHealth
    };
    window.__signals__.collisions.push(collisionData);

    console.log('Collision detected:', JSON.stringify(collisionData));

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    
    // 击退距离基于速度200计算（速度200对应击退距离100）
    const knockbackDistance = 100;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 目标位置
    const targetX = player.x + knockbackX;
    const targetY = player.y + knockbackY;

    // 记录击退事件
    const knockbackData = {
      timestamp: Date.now(),
      fromPos: { x: player.x, y: player.y },
      toPos: { x: targetX, y: targetY },
      distance: knockbackDistance,
      angle: angle
    };
    window.__signals__.knockbackEvents.push(knockbackData);

    // 击退动画（0.3秒）
    this.tweens.add({
      targets: player,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Power2'
    });

    // 闪烁效果（0.5秒内多次闪烁）
    const blinkData = {
      timestamp: Date.now(),
      duration: 500,
      blinkCount: 5
    };
    window.__signals__.blinkEvents.push(blinkData);

    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 50,
      yoyo: true,
      repeat: 4, // 重复4次，加上初始一次共5次闪烁
      onComplete: () => {
        // 恢复正常透明度
        player.alpha = 1;
        // 解除无敌状态
        this.isInvulnerable = false;
        console.log('Invulnerability ended');
      }
    });

    this.updateStatus();
  }

  update() {
    // 玩家控制
    if (!this.isInvulnerable) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
      } else {
        this.player.setVelocityX(0);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-200);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(200);
      } else {
        this.player.setVelocityY(0);
      }
    } else {
      // 无敌状态下停止玩家移动
      this.player.setVelocity(0, 0);
    }

    this.updateStatus();

    // 游戏结束检测
    if (this.playerHealth <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.player.setTint(0x888888);
      this.add.text(400, 300, 'GAME OVER', {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }).setOrigin(0.5);
      console.log('Game Over - Final signals:', JSON.stringify(window.__signals__));
    }
  }

  updateStatus() {
    const invulnText = this.isInvulnerable ? ' [无敌中]' : '';
    this.statusText.setText(
      `生命值: ${this.playerHealth}${invulnText}\n` +
      `碰撞次数: ${window.__signals__.collisions.length}\n` +
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
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

// 定期输出信号到控制台（用于验证）
setInterval(() => {
  if (window.__signals__.collisions.length > 0) {
    console.log('Current signals summary:', {
      totalCollisions: window.__signals__.collisions.length,
      playerHealth: window.__signals__.playerHealth,
      knockbackCount: window.__signals__.knockbackEvents.length,
      blinkCount: window.__signals__.blinkEvents.length
    });
  }
}, 2000);