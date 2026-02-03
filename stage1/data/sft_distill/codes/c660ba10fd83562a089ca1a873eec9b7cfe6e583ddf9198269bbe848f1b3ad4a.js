// 全局信号收集器
window.__signals__ = {
  hitCount: 0,
  knockbackEvents: [],
  blinkEvents: [],
  playerHealth: 100
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.enemy = null;
    this.isHurt = false;
    this.blinkTween = null;
    this.knockbackTween = null;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
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

    // 创建玩家精灵
    this.player = this.physics.add.sprite(200, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setVelocity(150, 0); // 设置初始速度使其移动

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(500, 300, 'enemy');
    this.enemy.setImmovable(true);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemy, this.onHit, null, this);

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 550, '方向键控制角色移动，碰撞敌人触发受伤效果', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    this.updateDebugText();
  }

  onHit(player, enemy) {
    // 如果正在受伤状态，不重复触发
    if (this.isHurt) {
      return;
    }

    this.isHurt = true;
    window.__signals__.hitCount++;
    window.__signals__.playerHealth -= 10;

    // 计算击退方向（从敌人指向玩家）
    const knockbackSpeed = 200;
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    
    const knockbackDistance = knockbackSpeed * 0.3; // 击退距离与速度相关
    const knockbackX = Math.cos(angle) * knockbackDistance;
    const knockbackY = Math.sin(angle) * knockbackDistance;

    // 记录击退事件
    const knockbackEvent = {
      timestamp: Date.now(),
      fromX: player.x,
      fromY: player.y,
      toX: player.x + knockbackX,
      toY: player.y + knockbackY,
      distance: knockbackDistance,
      angle: angle
    };
    window.__signals__.knockbackEvents.push(knockbackEvent);

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 击退效果
    this.knockbackTween = this.tweens.add({
      targets: player,
      x: player.x + knockbackX,
      y: player.y + knockbackY,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // 击退完成后恢复控制
        this.knockbackTween = null;
      }
    });

    // 闪烁效果（0.5秒内快速闪烁）
    let blinkCount = 0;
    const blinkEvent = {
      timestamp: Date.now(),
      duration: 500,
      blinkCount: 0
    };
    window.__signals__.blinkEvents.push(blinkEvent);

    this.blinkTween = this.tweens.add({
      targets: player,
      alpha: 0.2,
      duration: 50,
      yoyo: true,
      repeat: 4, // 重复4次，总共5次闪烁，耗时约500ms
      onRepeat: () => {
        blinkCount++;
        blinkEvent.blinkCount = blinkCount;
      },
      onComplete: () => {
        player.alpha = 1;
        this.isHurt = false;
        this.blinkTween = null;
        blinkEvent.blinkCount = blinkCount + 1;
        console.log('Hurt effect completed:', JSON.stringify(blinkEvent));
      }
    });

    // 0.5秒后确保恢复状态（双重保险）
    this.time.delayedCall(500, () => {
      if (this.isHurt) {
        player.alpha = 1;
        this.isHurt = false;
        if (this.blinkTween) {
          this.blinkTween.stop();
          this.blinkTween = null;
        }
      }
    });

    this.updateDebugText();
    
    // 输出日志
    console.log('Hit detected!', JSON.stringify({
      hitCount: window.__signals__.hitCount,
      health: window.__signals__.playerHealth,
      knockback: knockbackEvent
    }));
  }

  update(time, delta) {
    // 只在非受伤状态下允许控制
    if (!this.isHurt && !this.knockbackTween) {
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
    }

    this.updateDebugText();
  }

  updateDebugText() {
    this.debugText.setText([
      `Hit Count: ${window.__signals__.hitCount}`,
      `Health: ${window.__signals__.playerHealth}`,
      `Hurt State: ${this.isHurt}`,
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Player Alpha: ${this.player.alpha.toFixed(2)}`,
      `Blink Events: ${window.__signals__.blinkEvents.length}`,
      `Knockback Events: ${window.__signals__.knockbackEvents.length}`
    ]);
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

// 输出初始信号状态
console.log('Game initialized. Signals:', JSON.stringify(window.__signals__, null, 2));