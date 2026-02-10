// Boss战游戏 - 击败青色Boss
class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 3; // Boss血量
    this.maxBossHealth = 3;
    this.gameWon = false; // 游戏胜利标志
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建青色Boss纹理
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x00FFFF, 1); // 青色
    bossGraphics.fillRect(0, 0, 80, 60);
    bossGraphics.fillStyle(0x00CCCC, 1);
    bossGraphics.fillTriangle(10, 60, 40, 80, 70, 60); // 底部装饰
    bossGraphics.generateTexture('boss', 80, 80);
    bossGraphics.destroy();

    // 创建玩家飞船纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00FF00, 1); // 绿色
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xFFFF00, 1); // 黄色
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height - 80, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建Boss
    this.boss = this.physics.add.sprite(width / 2, 100, 'boss');
    this.boss.setCollideWorldBounds(true);
    this.boss.body.setVelocityX(100); // Boss左右移动

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;

    // 碰撞检测：子弹击中Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // Boss碰到边界反向移动
    this.physics.world.on('worldbounds', (body) => {
      if (body.gameObject === this.boss) {
        this.boss.setVelocityX(-this.boss.body.velocity.x);
      }
    });
    this.boss.body.onWorldBounds = true;

    // UI文本 - Boss血量
    this.healthText = this.add.text(16, 16, `Boss血量: ${this.bossHealth}/${this.maxBossHealth}`, {
      fontSize: '24px',
      fill: '#fff',
      fontFamily: 'Arial'
    });

    // 胜利文本（初始隐藏）
    this.victoryText = this.add.text(width / 2, height / 2, '胜利！', {
      fontSize: '64px',
      fill: '#FFD700',
      fontFamily: 'Arial',
      stroke: '#000',
      strokeThickness: 6
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    // 操作提示
    this.add.text(16, height - 40, '方向键移动 | 空格射击', {
      fontSize: '18px',
      fill: '#aaa',
      fontFamily: 'Arial'
    });

    // 状态信号（用于验证）
    this.registry.set('bossHealth', this.bossHealth);
    this.registry.set('gameWon', this.gameWon);
  }

  update(time, delta) {
    if (this.gameWon) {
      return; // 游戏胜利后停止更新
    }

    // 玩家移动
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

    // 发射子弹（每300ms最多一发）
    if (this.spaceKey.isDown && time > this.lastFired + 300) {
      this.fireBullet();
      this.lastFired = time;
    }

    // 清理飞出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
  }

  fireBullet() {
    // 从对象池获取子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.setVelocityY(-120); // 子弹速度120（向上）
    }
  }

  hitBoss(bullet, boss) {
    // 子弹击中Boss
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.body.setVelocity(0, 0);

    // Boss扣血
    this.bossHealth--;
    this.healthText.setText(`Boss血量: ${this.bossHealth}/${this.maxBossHealth}`);

    // 更新状态信号
    this.registry.set('bossHealth', this.bossHealth);

    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    // 检查Boss是否被击败
    if (this.bossHealth <= 0) {
      this.defeatBoss();
    }
  }

  defeatBoss() {
    this.gameWon = true;
    this.registry.set('gameWon', this.gameWon);

    // Boss爆炸效果
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 2,
      angle: 360,
      duration: 500,
      onComplete: () => {
        this.boss.destroy();
      }
    });

    // 显示胜利文本
    this.victoryText.setVisible(true);
    this.tweens.add({
      targets: this.victoryText,
      scale: { from: 0, to: 1.2 },
      duration: 500,
      ease: 'Back.easeOut'
    });

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 清除所有子弹
    this.bullets.clear(true, true);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BossBattleScene
};

// 启动游戏
const game = new Phaser.Game(config);