// 完整的 Phaser3 代码
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isHurt = false;
    this.hurtCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      hurtCount: 0,
      lastHurtTime: 0,
      knockbackDistance: 0,
      isFlashing: false,
      flashDuration: 0
    };

    // 创建紫色角色纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x9b59b6, 1); // 紫色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xe74c3c, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建紫色角色（玩家）
    this.player = this.physics.add.sprite(200, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(40, 40);

    // 创建敌人
    this.enemy = this.physics.add.sprite(600, 300, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    this.enemy.body.setSize(40, 40);
    
    // 让敌人缓慢移动
    this.enemy.setVelocityX(-50);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleCollision,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加提示文本
    this.add.text(10, 10, '使用方向键移动紫色角色\n碰撞红色敌人触发受伤效果', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 状态文本
    this.statusText = this.add.text(10, 60, '', {
      fontSize: '14px',
      fill: '#00ff00'
    });

    // 闪烁计时器引用
    this.flashTimer = null;
  }

  handleCollision(player, enemy) {
    // 如果已经在受伤状态，不重复触发
    if (this.isHurt) {
      return;
    }

    this.isHurt = true;
    this.hurtCount++;

    // 更新信号
    window.__signals__.hurtCount = this.hurtCount;
    window.__signals__.lastHurtTime = this.time.now;
    window.__signals__.isFlashing = true;
    window.__signals__.flashDuration = 3000;

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离与速度120相关（速度120，击退0.5秒，距离=120*0.5=60）
    const knockbackSpeed = 120;
    const knockbackTime = 500; // 毫秒
    const knockbackDistance = (knockbackSpeed * knockbackTime) / 1000;
    
    window.__signals__.knockbackDistance = knockbackDistance;

    // 计算击退目标位置
    const targetX = player.x + Math.cos(angle) * knockbackDistance;
    const targetY = player.y + Math.sin(angle) * knockbackDistance;

    // 限制在世界边界内
    const clampedX = Phaser.Math.Clamp(targetX, 20, 780);
    const clampedY = Phaser.Math.Clamp(targetY, 20, 580);

    // 播放击退动画
    this.tweens.add({
      targets: player,
      x: clampedX,
      y: clampedY,
      duration: knockbackTime,
      ease: 'Cubic.easeOut'
    });

    // 开始闪烁效果（3秒）
    let flashCount = 0;
    const flashInterval = 150; // 每150ms切换一次
    const totalFlashes = Math.floor(3000 / flashInterval);

    this.flashTimer = this.time.addEvent({
      delay: flashInterval,
      callback: () => {
        flashCount++;
        // 在0.3和1之间切换透明度
        player.alpha = player.alpha === 1 ? 0.3 : 1;

        // 3秒后停止闪烁
        if (flashCount >= totalFlashes) {
          player.alpha = 1;
          this.isHurt = false;
          window.__signals__.isFlashing = false;
          if (this.flashTimer) {
            this.flashTimer.remove();
            this.flashTimer = null;
          }
        }
      },
      loop: true
    });

    // 记录日志
    console.log(JSON.stringify({
      event: 'player_hurt',
      time: this.time.now,
      hurtCount: this.hurtCount,
      knockbackDistance: knockbackDistance,
      knockbackAngle: angle,
      targetPosition: { x: clampedX, y: clampedY }
    }));
  }

  update(time, delta) {
    // 只有在非受伤状态才能移动
    if (!this.isHurt) {
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
    } else {
      // 受伤时停止移动输入
      this.player.setVelocity(0, 0);
    }

    // 敌人边界反弹
    if (this.enemy.x <= 40 || this.enemy.x >= 760) {
      this.enemy.setVelocityX(-this.enemy.body.velocity.x);
    }

    // 更新状态文本
    this.statusText.setText(
      `受伤次数: ${this.hurtCount}\n` +
      `当前状态: ${this.isHurt ? '受伤中(闪烁)' : '正常'}\n` +
      `透明度: ${this.player.alpha.toFixed(2)}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
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