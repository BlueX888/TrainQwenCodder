class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.isInvincible = false;
    this.hitCount = 0; // 受击次数统计
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建粉色玩家角色
    this.createPlayer();
    
    // 创建多个敌人
    this.createEnemies();
    
    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 添加键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加说明文字
    this.add.text(10, 550, '使用方向键移动粉色角色，碰撞敌人触发受伤效果', {
      fontSize: '14px',
      fill: '#ffff00'
    });
  }

  createPlayer() {
    // 使用 Graphics 创建粉色角色纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff1493, 1); // 粉色
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();

    // 创建物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setCircle(20);
  }

  createEnemies() {
    // 使用 Graphics 创建敌人纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff0000, 1); // 红色
    graphics.fillRect(0, 0, 30, 30);
    graphics.generateTexture('enemy', 30, 30);
    graphics.destroy();

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 创建多个敌人，设置固定位置
    const enemyPositions = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 200, y: 450 },
      { x: 600, y: 450 },
      { x: 400, y: 100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.body.setSize(30, 30);
      
      // 给敌人添加简单的移动模式
      this.tweens.add({
        targets: enemy,
        x: pos.x + (Math.random() > 0.5 ? 100 : -100),
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });
  }

  handleCollision(player, enemy) {
    // 如果处于无敌状态，不触发受伤
    if (this.isInvincible) {
      return;
    }

    // 触发受伤效果
    this.triggerHurtEffect(player, enemy);
  }

  triggerHurtEffect(player, enemy) {
    // 减少生命值
    this.health -= 10;
    this.hitCount++;
    this.updateStatusText();

    // 设置无敌状态
    this.isInvincible = true;

    // 计算击退方向
    const knockbackDirection = new Phaser.Math.Vector2(
      player.x - enemy.x,
      player.y - enemy.y
    ).normalize();

    // 击退距离（基于速度 80）
    const knockbackDistance = 80;
    const knockbackX = player.x + knockbackDirection.x * knockbackDistance;
    const knockbackY = player.y + knockbackDirection.y * knockbackDistance;

    // 停止玩家当前移动
    player.setVelocity(0, 0);

    // 击退动画（快速击退）
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: 200,
      ease: 'Cubic.easeOut'
    });

    // 闪烁效果（2秒）
    this.createBlinkEffect(player, 2000);

    // 2秒后恢复正常状态
    this.time.delayedCall(2000, () => {
      this.isInvincible = false;
      player.setAlpha(1); // 确保完全显示
      this.updateStatusText();
    });
  }

  createBlinkEffect(target, duration) {
    // 停止之前的闪烁动画（如果存在）
    if (this.blinkTween) {
      this.blinkTween.stop();
    }

    // 创建闪烁动画
    this.blinkTween = this.tweens.add({
      targets: target,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: Math.floor(duration / 200), // 计算重复次数
      onComplete: () => {
        target.setAlpha(1); // 确保结束时完全显示
      }
    });
  }

  updateStatusText() {
    const invincibleStatus = this.isInvincible ? '无敌中' : '正常';
    this.statusText.setText(
      `生命值: ${this.health} | 受击次数: ${this.hitCount} | 状态: ${invincibleStatus}`
    );
  }

  update(time, delta) {
    // 只有在非无敌状态且没有被击退时才能移动
    if (!this.isInvincible) {
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