// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  collisionCount: 0,
  isHurt: false,
  knockbackDistance: 0,
  blinkCount: 0,
  playerHealth: 100,
  logs: []
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.isInvincible = false;
    this.knockbackSpeed = 120; // 击退速度参数
  }

  preload() {
    // 创建紫色角色纹理
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x9932cc, 1); // 紫色
    graphics1.fillRect(0, 0, 40, 40);
    graphics1.generateTexture('player', 40, 40);
    graphics1.destroy();

    // 创建红色敌人纹理
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0xff0000, 1); // 红色
    graphics2.fillRect(0, 0, 40, 40);
    graphics2.generateTexture('enemy', 40, 40);
    graphics2.destroy();
  }

  create() {
    // 添加说明文字
    this.add.text(10, 10, 'Use Arrow Keys to Move\nCollide with Red Enemy to Trigger Hurt Effect', {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 创建紫色玩家角色
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);

    // 创建红色敌人（可移动以便测试）
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setVelocity(50, 30); // 敌人自动移动
    this.enemy.setCollideWorldBounds(true);
    this.enemy.setBounce(1);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.onCollision, null, this);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 60, '', {
      fontSize: '14px',
      color: '#00ff00'
    });

    // 记录初始状态
    this.logSignal('Game started');
  }

  update() {
    // 玩家移动控制
    if (!this.isInvincible) {
      this.player.setVelocity(0);

      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
      }

      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-160);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(160);
      }
    }

    // 更新状态显示
    this.statusText.setText(
      `Health: ${window.__signals__.playerHealth}\n` +
      `Collisions: ${window.__signals__.collisionCount}\n` +
      `Is Hurt: ${window.__signals__.isHurt}\n` +
      `Invincible: ${this.isInvincible}`
    );
  }

  onCollision(player, enemy) {
    // 如果正在无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 更新信号状态
    window.__signals__.collisionCount++;
    window.__signals__.isHurt = true;
    window.__signals__.playerHealth -= 10;
    
    this.logSignal(`Collision detected at (${Math.round(player.x)}, ${Math.round(player.y)})`);

    // 设置无敌状态
    this.isInvincible = true;

    // 计算击退方向和距离
    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const knockbackDistance = (this.knockbackSpeed / 60) * 0.5 * 1000; // 基于速度120计算击退距离
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 限制在世界边界内
    const finalX = Phaser.Math.Clamp(targetX, 20, 780);
    const finalY = Phaser.Math.Clamp(targetY, 20, 580);

    window.__signals__.knockbackDistance = Phaser.Math.Distance.Between(
      player.x, player.y, finalX, finalY
    );

    this.logSignal(`Knockback distance: ${Math.round(window.__signals__.knockbackDistance)}px`);

    // 停止玩家当前速度
    player.setVelocity(0);

    // 击退效果 Tween
    this.tweens.add({
      targets: player,
      x: finalX,
      y: finalY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.logSignal('Knockback completed');
      }
    });

    // 闪烁效果：3秒内重复闪烁
    let blinkCount = 0;
    const blinkTween = this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 150,
      yoyo: true,
      repeat: 19, // 3秒 / (150ms * 2) ≈ 10次完整闪烁 = 20次单向
      onRepeat: () => {
        blinkCount++;
        window.__signals__.blinkCount = Math.floor(blinkCount / 2);
      },
      onComplete: () => {
        player.alpha = 1;
        this.isInvincible = false;
        window.__signals__.isHurt = false;
        this.logSignal('Hurt effect ended, invincibility removed');
      }
    });

    this.logSignal('Hurt effect started: 3s blink + knockback');
  }

  logSignal(message) {
    const logEntry = {
      time: this.time.now,
      message: message,
      state: {
        collisionCount: window.__signals__.collisionCount,
        health: window.__signals__.playerHealth,
        isHurt: window.__signals__.isHurt
      }
    };
    window.__signals__.logs.push(logEntry);
    console.log('[SIGNAL]', JSON.stringify(logEntry));
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