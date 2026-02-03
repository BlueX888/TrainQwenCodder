// MenuScene - 菜单场景
class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
    this.buttonBounds = { x: 300, y: 250, width: 200, height: 80 };
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 添加标题
    const title = this.add.text(400, 150, '游戏菜单', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 使用 Graphics 绘制蓝色按钮
    const buttonGraphics = this.add.graphics();
    buttonGraphics.fillStyle(0x0066cc, 1); // 蓝色
    buttonGraphics.fillRoundedRect(
      this.buttonBounds.x,
      this.buttonBounds.y,
      this.buttonBounds.width,
      this.buttonBounds.height,
      10
    );

    // 添加按钮文本
    const buttonText = this.add.text(400, 290, '开始游戏', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    buttonText.setOrigin(0.5);

    // 添加悬停效果的图形（初始隐藏）
    const hoverGraphics = this.add.graphics();
    hoverGraphics.fillStyle(0x0088ff, 1); // 浅蓝色
    hoverGraphics.fillRoundedRect(
      this.buttonBounds.x,
      this.buttonBounds.y,
      this.buttonBounds.width,
      this.buttonBounds.height,
      10
    );
    hoverGraphics.setVisible(false);

    // 监听鼠标移动事件（悬停效果）
    this.input.on('pointermove', (pointer) => {
      const isOver = this.isPointerOverButton(pointer);
      hoverGraphics.setVisible(isOver);
      buttonGraphics.setVisible(!isOver);
    });

    // 监听点击事件
    this.input.on('pointerdown', (pointer) => {
      if (this.isPointerOverButton(pointer)) {
        // 点击按钮，切换到游戏场景
        this.scene.start('GameScene');
      }
    });

    // 添加提示文本
    const hint = this.add.text(400, 450, '点击按钮开始游戏', {
      fontSize: '20px',
      color: '#888888'
    });
    hint.setOrigin(0.5);
  }

  // 判断指针是否在按钮范围内
  isPointerOverButton(pointer) {
    return pointer.x >= this.buttonBounds.x &&
           pointer.x <= this.buttonBounds.x + this.buttonBounds.width &&
           pointer.y >= this.buttonBounds.y &&
           pointer.y <= this.buttonBounds.y + this.buttonBounds.height;
  }
}

// GameScene - 游戏场景
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态变量
    this.score = 0;
    this.level = 1;
    this.health = 100;
    this.gameTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 添加背景色
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, 800, 600);

    // 添加标题
    const title = this.add.text(400, 80, '游戏场景', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5);

    // 显示游戏状态信息
    this.scoreText = this.add.text(50, 150, `分数: ${this.score}`, {
      fontSize: '28px',
      color: '#00ff00'
    });

    this.levelText = this.add.text(50, 200, `等级: ${this.level}`, {
      fontSize: '28px',
      color: '#ffaa00'
    });

    this.healthText = this.add.text(50, 250, `生命值: ${this.health}`, {
      fontSize: '28px',
      color: '#ff0000'
    });

    this.timeText = this.add.text(50, 300, `游戏时间: ${this.gameTime}s`, {
      fontSize: '28px',
      color: '#00aaff'
    });

    // 添加玩家方块（使用 Graphics）
    this.player = this.add.graphics();
    this.player.fillStyle(0x00ff00, 1);
    this.player.fillRect(-25, -25, 50, 50);
    this.player.x = 400;
    this.player.y = 450;

    // 添加操作提示
    const controls = this.add.text(400, 520, '方向键移动 | ESC 返回菜单', {
      fontSize: '20px',
      color: '#888888'
    });
    controls.setOrigin(0.5);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // 添加点击增加分数的交互区域
    const clickArea = this.add.graphics();
    clickArea.fillStyle(0x4444ff, 0.3);
    clickArea.fillRect(500, 150, 250, 200);
    
    const clickText = this.add.text(625, 250, '点击此区域\n增加分数', {
      fontSize: '22px',
      color: '#ffffff',
      align: 'center'
    });
    clickText.setOrigin(0.5);

    // 监听点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.x >= 500 && pointer.x <= 750 &&
          pointer.y >= 150 && pointer.y <= 350) {
        this.score += 10;
        this.scoreText.setText(`分数: ${this.score}`);
        
        // 每100分升级
        if (this.score % 100 === 0 && this.score > 0) {
          this.level++;
          this.levelText.setText(`等级: ${this.level}`);
        }
      }
    });
  }

  update(time, delta) {
    // 更新游戏时间
    this.gameTime = Math.floor(time / 1000);
    this.timeText.setText(`游戏时间: ${this.gameTime}s`);

    // 键盘控制玩家移动
    const speed = 5;
    if (this.cursors.left.isDown) {
      this.player.x -= speed;
    }
    if (this.cursors.right.isDown) {
      this.player.x += speed;
    }
    if (this.cursors.up.isDown) {
      this.player.y -= speed;
    }
    if (this.cursors.down.isDown) {
      this.player.y += speed;
    }

    // 限制玩家在屏幕范围内
    this.player.x = Phaser.Math.Clamp(this.player.x, 25, 775);
    this.player.y = Phaser.Math.Clamp(this.player.y, 375, 575);

    // 按 ESC 返回菜单
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.start('MenuScene');
    }

    // 模拟生命值变化（每5秒恢复1点）
    if (this.gameTime % 5 === 0 && this.gameTime > 0 && this.health < 100) {
      if (!this.lastHealTime || this.lastHealTime !== this.gameTime) {
        this.health = Math.min(100, this.health + 1);
        this.healthText.setText(`生命值: ${this.health}`);
        this.lastHealTime = this.gameTime;
      }
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d44',
  scene: [MenuScene, GameScene], // 注册两个场景
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);