class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 状态信号：记录排序次数
    this.objects = []; // 存储所有可拖拽物体
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景提示文字
    this.add.text(400, 30, '拖拽白色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 60, `排序次数: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建8个白色矩形物体
    const objectWidth = 80;
    const objectHeight = 60;
    const colors = [0xffffff, 0xf0f0f0, 0xe0e0e0, 0xd0d0d0, 
                    0xffffff, 0xf0f0f0, 0xe0e0e0, 0xd0d0d0];

    for (let i = 0; i < 8; i++) {
      // 随机初始位置
      const x = 100 + Math.random() * 600;
      const y = 120 + Math.random() * 400;

      // 使用Graphics创建白色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(colors[i], 1);
      graphics.fillRect(0, 0, objectWidth, objectHeight);
      
      // 添加边框
      graphics.lineStyle(2, 0x333333, 1);
      graphics.strokeRect(0, 0, objectWidth, objectHeight);

      // 生成纹理
      const textureKey = `object${i}`;
      graphics.generateTexture(textureKey, objectWidth, objectHeight);
      graphics.destroy();

      // 创建精灵
      const sprite = this.add.sprite(x, y, textureKey);
      sprite.setInteractive({ draggable: true, cursor: 'pointer' });
      sprite.objectId = i; // 用于调试

      // 添加编号文字
      const text = this.add.text(0, 0, `#${i + 1}`, {
        fontSize: '18px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // 创建容器组合精灵和文字
      const container = this.add.container(x, y, [sprite, text]);
      container.setSize(objectWidth, objectHeight);
      container.setInteractive({ draggable: true, cursor: 'pointer' });
      container.objectId = i;

      // 存储原始精灵引用（用于后续操作）
      sprite.parentContainer = container;

      this.objects.push(container);

      // 拖拽开始效果
      container.on('dragstart', (pointer, dragX, dragY) => {
        container.setScale(1.1);
        container.setDepth(100);
      });

      // 拖拽中
      container.on('drag', (pointer, dragX, dragY) => {
        container.x = dragX;
        container.y = dragY;
      });

      // 拖拽结束
      container.on('dragend', (pointer) => {
        container.setScale(1);
        container.setDepth(0);
        this.sortObjects();
      });
    }

    // 添加说明文字
    this.add.text(400, 570, '拖拽任意方块后松手，所有方块将按Y坐标从上到下排列', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  sortObjects() {
    // 按当前Y坐标排序
    this.objects.sort((a, b) => a.y - b.y);

    // 计算新的排列位置
    const startY = 150;
    const spacing = 50;
    const targetX = 400;

    // 更新排序次数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);

    // 使用Tween动画移动到新位置
    this.objects.forEach((obj, index) => {
      const targetY = startY + index * spacing;

      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 确保文字跟随
        }
      });
    });

    // 添加视觉反馈
    this.cameras.main.flash(100, 255, 255, 255, false, 0.1);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态用于验证（可选）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, DragSortScene };
}