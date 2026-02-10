class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100; // 可验证的状态信号
    this.isInvulnerable = false; // 无敌状态
    this.hitCount = 0; // 受击次数统计
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建绿色玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建红色敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家精灵（绿色方块）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setDrag(500); // 添加拖拽力，使击退效果更自然

    // 创建敌人精灵（红色圆形）
    this.enemy = this.physics.add.sprite(200, 300, 'enemy');
    this.enemy.setCollideWorldBounds(true);
    
    // 让敌人缓慢移动以便测试碰撞
    this.enemy.setVelocity(50, 30);
    this.enemy.setBounce(1, 1);

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemy,
      this.handleHit,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateStatusText();

    // 添加提示文本
    this.add.text(400, 550, '使用方向键移动绿色方块，碰撞红色圆形触发受伤效果', {
      fontSize: '14px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
  }

  update() {
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
    this.updateStatusText();
  }

  handleHit(player, enemy) {
    // 如果处于无敌状态，不触发受伤效果
    if (this.isInvulnerable) {
      return;
    }

    // 扣除生命值
    this.health -= 10;
    this.hitCount++;

    // 设置无敌状态
    this.isInvulnerable = true;

    // 计算击退方向（从敌人指向玩家）
    const knockbackSpeed = 300;
    const angle = Phaser.Math.Angle.Between(
      enemy.x,
      enemy.y,
      player.x,
      player.y
    );

    // 应用击退速度
    const velocityX = Math.cos(angle) * knockbackSpeed;
    const velocityY = Math.sin(angle) * knockbackSpeed;
    player.setVelocity(velocityX, velocityY);

    // 创建闪烁效果（1秒内循环闪烁）
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 9, // 重复9次，加上初始1次共10次，总计1秒（100ms * 10 * 2）
      onComplete: () => {
        // 闪烁结束后恢复完全不透明
        player.alpha = 1;
        // 解除无敌状态
        this.isInvulnerable = false;
      }
    });

    // 添加视觉反馈：屏幕轻微震动
    this.cameras.main.shake(200, 0.005);

    // 更新状态文本
    this.updateStatusText();

    // 如果生命值归零，显示游戏结束
    if (this.health <= 0) {
      this.health = 0;
      this.gameOver();
    }
  }

  updateStatusText() {
    const invulnerableStatus = this.isInvulnerable ? '无敌中' : '正常';
    this.statusText.setText(
      `生命值: ${this.health}\n` +
      `受击次数: ${this.hitCount}\n` +
      `状态: ${invulnerableStatus}\n` +
      `玩家位置: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }

  gameOver() {
    // 停止物理系统
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: gameOverText,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
      this.health = 100;
      this.hitCount = 0;
      this.isInvulnerable = false;
    });
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
      debug: false // 设置为 true 可查看碰撞体
    }
  },
  scene: GameScene
};

new Phaser.Game(config);