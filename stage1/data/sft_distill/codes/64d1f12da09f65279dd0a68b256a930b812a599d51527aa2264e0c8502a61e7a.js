class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.hitCount = 0; // 状态信号：受伤次数
    this.isHurt = false; // 受伤状态标记
  }

  preload() {
    // 不需要外部资源
  }

  create() {
    // 创建黄色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0xffff00, 1); // 黄色
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1); // 红色
    enemyGraphics.fillRect(0, 0, 40, 40);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人（移动的敌人）
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setVelocity(100, 0);
    this.enemy.setBounce(1, 1);
    this.enemy.setCollideWorldBounds(true);

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

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    this.updateStatusText();

    // 提示文本
    this.add.text(10, 550, '使用方向键移动黄色角色，碰撞红色敌人触发受伤效果', {
      fontSize: '16px',
      fill: '#ffffff'
    });
  }

  handleCollision(player, enemy) {
    // 如果已经在受伤状态，不重复触发
    if (this.isHurt) {
      return;
    }

    this.isHurt = true;
    this.hitCount++;
    this.updateStatusText();

    // 计算击退方向（从敌人指向玩家）
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 击退距离基于速度80
    const knockbackDistance = 80;
    const knockbackX = player.x + Math.cos(angle) * knockbackDistance;
    const knockbackY = player.y + Math.sin(angle) * knockbackDistance;

    // 停止玩家当前速度
    player.setVelocity(0, 0);

    // 击退动画（0.3秒完成击退）
    this.tweens.add({
      targets: player,
      x: knockbackX,
      y: knockbackY,
      duration: 300,
      ease: 'Power2'
    });

    // 闪烁效果（2秒内闪烁）
    let blinkCount = 0;
    const maxBlinks = 10; // 2秒内闪烁10次
    const blinkInterval = 200; // 每次闪烁间隔200ms

    const blinkTimer = this.time.addEvent({
      delay: blinkInterval,
      callback: () => {
        // 切换透明度
        player.alpha = player.alpha === 1 ? 0.3 : 1;
        blinkCount++;

        // 2秒后停止闪烁
        if (blinkCount >= maxBlinks) {
          player.alpha = 1; // 恢复完全不透明
          this.isHurt = false; // 解除受伤状态
          blinkTimer.remove();
        }
      },
      loop: true
    });
  }

  updateStatusText() {
    this.statusText.setText(
      `受伤次数: ${this.hitCount}\n` +
      `受伤状态: ${this.isHurt ? '是' : '否'}`
    );
  }

  update(time, delta) {
    // 玩家移动控制（仅在非受伤状态下可控制）
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