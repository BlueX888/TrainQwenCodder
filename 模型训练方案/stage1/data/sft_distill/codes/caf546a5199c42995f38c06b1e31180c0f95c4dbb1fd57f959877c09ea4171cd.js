// 全局信号对象，用于验证游戏状态
window.__signals__ = {
  playerHealth: 3,
  hitCount: 0,
  knockbackEvents: [],
  lastHitTime: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isInvincible = false;
    this.knockbackSpeed = 200;
  }

  preload() {
    // 创建青色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ffff, 1); // 青色
    playerGraphics.fillCircle(20, 20, 20);
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
    // 创建背景
    this.add.rectangle(400, 300, 800, 600, 0x222222);

    // 创建玩家角色（青色）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 0);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.onPlayerHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建UI文本
    this.healthText = this.add.text(16, 16, `Health: ${window.__signals__.playerHealth}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.hitCountText = this.add.text(16, 48, `Hits: ${window.__signals__.hitCount}`, {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(16, 80, 'Status: Normal', {
      fontSize: '20px',
      fill: '#00ff00'
    });

    // 添加说明文字
    this.add.text(400, 550, 'Use Arrow Keys to Move. Avoid Red Enemy!', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    console.log('[GAME] Scene created, player health:', window.__signals__.playerHealth);
  }

  update(time, delta) {
    // 玩家移动控制
    if (!this.isInvincible) {
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
    }
  }

  onPlayerHit(player, enemy) {
    // 如果处于无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 设置无敌状态
    this.isInvincible = true;

    // 更新全局信号
    window.__signals__.playerHealth -= 1;
    window.__signals__.hitCount += 1;
    window.__signals__.lastHitTime = Date.now();

    // 计算击退方向
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 计算击退距离（基于速度200，击退0.3秒）
    const knockbackDistance = this.knockbackSpeed * 0.3;
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 记录击退事件
    const knockbackEvent = {
      time: Date.now(),
      fromX: player.x,
      fromY: player.y,
      toX: player.x + knockbackX,
      toY: player.y + knockbackY,
      distance: knockbackDistance
    };
    window.__signals__.knockbackEvents.push(knockbackEvent);

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 创建击退效果
    this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        console.log('[KNOCKBACK] Completed:', knockbackEvent);
      }
    });

    // 创建闪烁效果（0.5秒内循环）
    this.tweens.add({
      targets: player,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 4, // 重复4次，总共0.5秒（100ms * 2 * 5 = 1000ms，但我们需要500ms，所以是50ms * 2 * 5）
      onComplete: () => {
        player.alpha = 1;
        this.isInvincible = false;
        this.statusText.setText('Status: Normal');
        this.statusText.setColor('#00ff00');
        console.log('[INVINCIBLE] Ended, player can be hit again');
      }
    });

    // 调整闪烁时间为准确的0.5秒
    this.tweens.add({
      targets: player,
      alpha: { from: 1, to: 0.2 },
      duration: 50,
      yoyo: true,
      repeat: 4
    });

    // 更新UI
    this.healthText.setText(`Health: ${window.__signals__.playerHealth}`);
    this.hitCountText.setText(`Hits: ${window.__signals__.hitCount}`);
    this.statusText.setText('Status: Invincible');
    this.statusText.setColor('#ffff00');

    // 控制台输出
    console.log('[HIT] Player hit! Health:', window.__signals__.playerHealth, 'Total hits:', window.__signals__.hitCount);

    // 检查游戏结束
    if (window.__signals__.playerHealth <= 0) {
      this.gameOver();
    }
  }

  gameOver() {
    this.isInvincible = true;
    this.player.setVelocity(0, 0);
    this.enemy.setVelocity(0, 0);

    // 创建游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    this.statusText.setText('Status: Dead');
    this.statusText.setColor('#ff0000');

    console.log('[GAME OVER] Final stats:', JSON.stringify(window.__signals__, null, 2));
  }
}

// Phaser游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始状态
console.log('[INIT] Game started with signals:', window.__signals__);